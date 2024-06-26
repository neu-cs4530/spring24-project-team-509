import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  GroceryItem,
  GroceryStoreArea as GroceryStoreAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import Player from '../lib/Player';
import { supabase } from '../../supabaseClient';

/**
 * A class representing a grocery store area.
 * A grocery store area is an area in the town where players can buy items.
 * Players can interact with the grocery store area by opening the store, adding items to the cart,
 * removing items from the cart, and checking out.
 * The grocery store area has a store inventory, a cart, a total price, and a total balance.
 * The store inventory is a list of items available in the store.
 * The cart is a list of items that the player has added to the cart.
 * The total price is the total price of the items in the cart.
 * The total balance is the total balance of the player.
 * The grocery store area also has a purchase history, which is a list of items that the player has purchased.
 */
export default class GroceryStoreArea extends InteractableArea {
  protected _totalPrice = 0;

  protected _totalBalance = 100;

  protected _storeInventory: GroceryItem[] = [];

  protected _cart: GroceryItem[] = [];

  protected _history: GroceryItem[] = [];

  /**
   * Creates a new GroceryStoreArea
   *
   * @param GroceryStoreAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this grocery store area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id }: Omit<GroceryStoreAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._updateStoreInventory();
    this._updateCart();
    this._updateCartTotalPrice();
  }

  /**
   * Convert this GroceryStoreArea instance to a simple GroceryStoreAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): GroceryStoreAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'GroceryStoreArea',
      totalPrice: this._totalPrice,
      storeInventory: this._storeInventory,
      cart: this._cart,
      balance: this._totalBalance,
      history: this._history,
    };
  }

  /**
   * Creates a new GroceryStoreArea object that will represent a Grocery Store Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
   * @param broadcastEmitter An emitter that can be used by this conversation area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): GroceryStoreArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new GroceryStoreArea(
      {
        id: name,
        occupants: [],
        totalPrice: 0,
        storeInventory: [],
        cart: [],
        balance: 0,
        history: [],
      },
      rect,
      broadcastEmitter,
    );
  }

  /**
   * Handle a command from a player in this grocery store area.
   * Supported commands:
   * - OpenGroceryStoreCommand
   * - AddToCartCommand
   * - RemoveFromCartCommand
   * - CheckOutCommand
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   * to notify any listeners of a state update, including any change to store inventory)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'OpenGroceryStore') {
      this._updateStoreInventory();
      this._updateBalance(player.id);
      this._updateCart();
      this._updateHistory(player.id);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'AddToCart') {
      this._handleAddItem(command.itemName, command.price);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'RemoveFromCart') {
      this._handleRemoveItem(command.itemName);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'CheckOut') {
      this._handleCheckout(player.id);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Invalid command');
  }

  /**
   * To update the balance of the player.
   * If the player is new, the balance is set to 100.
   */
  private async _updateBalance(playerID: string): Promise<void> {
    const { data } = await supabase
      .from('playerInventory')
      .select('balance')
      .eq('playerID', playerID);
    if (data && data.length > 0) {
      this._totalBalance = data[0].balance;
    } else {
      this._totalBalance = 100;
    }
    this._emitAreaChanged();
  }

  /**
   * To update the store inventory.
   * To do this, we fetch the store inventory from the database.
   */
  private async _updateStoreInventory(): Promise<void> {
    const { data, error } = await supabase.from('StoreInventory').select();
    if (data) {
      this._storeInventory = data;
      this._emitAreaChanged();
    }
    if (error) {
      throw new Error('Error fetching store inventory');
    }
  }

  /**
   * To update the cart.
   * To do this, we fetch the items in the cart from the database.
   */
  private async _updateCart(): Promise<void> {
    const { data, error } = await supabase.from('storeCart').select();
    if (data) {
      this._cart = data;
      this._emitAreaChanged();
    }
    if (error) {
      throw new Error('Error fetching store cart');
    }
  }

  /**
   * Update the purchase history of the player.
   * @param playerID The ID of the player whose history to update.
   */
  private async _updateHistory(playerID: string): Promise<void> {
    const { data } = await supabase.from('playerInventory').select().eq('playerID', playerID);
    let historyList: { name: string; price: number; quantity: number }[] = [];
    if (data && data.length > 0) {
      historyList = JSON.parse(data[0].itemList);
    }
    this._history = historyList;
    this._emitAreaChanged();
  }

  /**
   * To find the total price of the items in the cart.
   * To do this, we first fetch the items in the cart.
   * Then we calculate the total price of the items in the cart.
   */
  private async _updateCartTotalPrice(): Promise<void> {
    let totalPrice = 0;
    const { data } = await supabase.from('storeCart').select();
    if (data && data.length > 0) {
      totalPrice = data.reduce(
        (acc: number, item: GroceryItem) => acc + item.price * item.quantity,
        0,
      );
    }
    this._totalPrice = totalPrice;
  }

  /**
   * To add the purchase history of the player.
   * @param playerID The ID of the player whose history to update.
   * @param itemList The list of items to add to the history.
   * @returns A promise that resolves when the history is updated.
   * @throws Error if there is an error updating the history.
   */
  private async _addHistory(playerID: string, itemList: GroceryItem[]): Promise<void> {
    await supabase.from('playerHistory').upsert([
      {
        playerID,
        itemList: JSON.stringify(itemList),
      },
    ]);
  }

  /**
   * To checkout the items in the cart.
   * To do this, we first fetch the items in the cart.
   * Then fetch the player's inventory.
   *  - update the player's inventory with the items in the cart.
   *  - update the player's balance.
   *  - delete the items in the cart.
   *  - update the cart.
   *  - update the history.
   * @param playerID The ID of the player checking out.
   */
  private async _handleCheckout(playerID: string): Promise<void> {
    const { data: cartData, error: cartError } = await supabase.from('storeCart').select();
    if (cartError) {
      throw new Error('Error fetching cart data');
    }

    if (cartData && cartData.length > 0) {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('playerInventory')
        .select('itemList')
        .eq('playerID', playerID);
      if (inventoryError) {
        throw new Error('Error fetching inventory data');
      }
      const { data: balance, error: balanceError } = await supabase
        .from('playerInventory')
        .select('balance')
        .eq('playerID', playerID);
      if (balanceError) {
        throw new Error('Error fetching balance data');
      }

      let inventoryList: { name: string; price: number; quantity: number }[] = [];
      if (inventoryData && inventoryData.length > 0) {
        inventoryList = JSON.parse(inventoryData[0].itemList);
      }
      let playerBalance = 100;
      if (balance && balance.length > 0) {
        playerBalance = balance[0].balance;
      }
      this._addHistory(playerID, cartData);
      cartData.forEach((cartItem: GroceryItem) => {
        const existingItem = inventoryList.find((item: GroceryItem) => item.name === cartItem.name);
        if (existingItem) {
          existingItem.quantity += cartItem.quantity;
        } else {
          inventoryList.push({
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity,
          });
        }
      });
      await supabase.from('playerInventory').upsert([
        {
          playerID,
          itemList: JSON.stringify(inventoryList),
          balance: playerBalance - this._totalPrice,
        },
      ]);

      const deletePromises = cartData.map(item =>
        supabase.from('storeCart').delete().eq('name', item.name),
      );
      await Promise.all(deletePromises);

      this._updateCart();
      this._updateHistory(playerID);
      this._totalPrice = 0;
      this._updateBalance(playerID);
    }
  }

  /**
   * To add an item to the cart and remove it from the store inventory.
   *
   * @param itemName is the name of the item to be added to the cart
   * @param price is the price of the item to be added to the cart
   */
  private async _handleAddItem(itemName: string, price: number): Promise<void> {
    await this._handleAddItemToCart(itemName, price);
    await this._handleRemoveItemFromStoreInventory(itemName);
    this._emitAreaChanged();
  }

  /**
   * To remove an item from the cart and add it back to the store inventory.
   *
   * @param itemName is the name of the item to be removed from the cart
   */
  private async _handleRemoveItem(itemName: string): Promise<void> {
    await this._handleRemoveItemFromCart(itemName);
    await this._handleAddItemToStoreInventory(itemName);
  }

  /**
   * To add an item to the cart, we first check if the item is already in the cart.
   * If it is, we update the quantity of the item in the cart.
   * If it is not, we insert the item into the cart.
   *
   * @param itemName is the name of the item to be added to the cart
   * @param price is the price of the item to be added to the cart
   */
  private async _handleAddItemToCart(itemName: string, price: number): Promise<void> {
    const { data } = await supabase.from('storeCart').select().eq('name', itemName);
    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('storeCart')
        .update({ quantity: item.quantity + 1 })
        .eq('name', itemName);
    } else {
      await supabase.from('storeCart').insert([{ name: itemName, price, quantity: 1 }]);
    }
    this._updateCart();
    this._updateCartTotalPrice();
  }

  /**
   * To remove an item from the cart, we first check if the item is in the cart.
   * If it is, we update the quantity of the item in the cart.
   * If the quantity of the item is 1, we delete the item from the cart.
   *
   * @param itemName is the name of the item to be removed from the cart
   */
  private async _handleRemoveItemFromCart(itemName: string): Promise<void> {
    const { data } = await supabase.from('storeCart').select().eq('name', itemName);
    if (data && data.length > 0) {
      const item = data[0];
      if (item.quantity > 0) {
        await supabase
          .from('storeCart')
          .update({ quantity: item.quantity - 1 })
          .eq('name', itemName);
        if (item.quantity === 1) {
          await supabase.from('storeCart').delete().eq('name', itemName);
        }
      } else {
        await supabase.from('storeCart').delete().eq('name', itemName);
      }
    }
    this._updateCart();
    this._updateCartTotalPrice();
  }

  /**
   * To add an item to the store inventory, we first check if the item is already in the store inventory.
   * If it is, we update the quantity of the item in the store inventory.
   * If it is not, we insert the item into the store inventory.
   *
   * @param itemName is the name of the item to be added to the store inventory
   */
  private async _handleAddItemToStoreInventory(itemName: string): Promise<void> {
    const { data } = await supabase.from('StoreInventory').select().eq('name', itemName);
    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('StoreInventory')
        .update({ quantity: item.quantity + 1 })
        .eq('name', itemName);
    } else {
      await supabase.from('StoreInventory').insert([{ name: itemName, quantity: 1 }]);
    }
    this._updateStoreInventory();
  }

  /**
   * To remove an item from the store inventory, we first check if the item is in the store inventory.
   * If it is, we update the quantity of the item in the store inventory.
   * If the quantity of the item is 1, we delete the item from the store inventory.
   *
   * @param itemName is the name of the item to be removed from the store inventory
   */
  private async _handleRemoveItemFromStoreInventory(itemName: string): Promise<void> {
    const { data } = await supabase.from('StoreInventory').select().eq('name', itemName);

    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('StoreInventory')
        .update({ quantity: item.quantity - 1 })
        .eq('name', itemName);
    }
    this._updateStoreInventory();
  }
}
