import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  GroceryStoreArea as GroceryStoreAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import Player from '../lib/Player';
import { supabase } from '../../supabaseClient';

export default class GroceryStoreArea extends InteractableArea {
  protected _totalPrice = 0;

  protected _storeInventory: any[] = [];

  protected _cart: any[] = [];

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

  public toModel(): GroceryStoreAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'GroceryStoreArea',
      totalPrice: this._totalPrice,
      storeInventory: this._storeInventory,
      cart: this._cart,
    };
  }

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
      { id: name, occupants: [], totalPrice: 0, storeInventory: [], cart: [] },
      rect,
      broadcastEmitter,
    );
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'OpenGroceryStore') {
      console.log('Open Grocery Store');
      this._updateStoreInventory();
      this._updateCart();
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
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Invalid command');
  }

  /**
   * To update the store inventory.
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

  // private async _updateCart2(playerID: string): Promise<void> {
  //   const { data, error } = await supabase.from('cart').select().eq('playerID', playerID);
  //   if (data) {
  //     this._cart = data;
  //     this._emitAreaChanged();
  //   } else {
  //     await supabase.from('cart').insert([{ playerID: playerID, itemList: JSON.stringify([]) }]);
  //   }
  //   if (error) {
  //     throw new Error('Error fetching store cart');
  //   }
  // }

  /**
   * To find the total price of the items in the cart.
   * To do this, we first fetch the items in the cart.
   * Then we calculate the total price of the items in the cart.
   */
  private async _updateCartTotalPrice(): Promise<void> {
    let totalPrice = 0;
    const { data } = await supabase.from('storeCart').select();
    if (data && data.length > 0) {
      totalPrice = data.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    }
    this._totalPrice = totalPrice;
    this._emitAreaChanged();
  }

  private async _handleCheckout(playerID: string): Promise<void> {
    const { data: cartData, error: cartError } = await supabase.from('storeCart').select();
    if (cartData && cartData.length > 0) {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('playerInventory')
        .select('itemList')
        .eq('playerID', playerID);
      let inventoryList: { name: any; price: any; quantity: any }[] = [];
      if (inventoryData && inventoryData.length > 0) {
        inventoryList = JSON.parse(inventoryData[0].itemList);
      }
      cartData.forEach((cartItem: any) => {
        const existingItem = inventoryList.find((item: any) => item.name === cartItem.name);
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
          balance: 100,
        },
      ]);

      const deletePromises = cartData.map(item =>
        supabase.from('storeCart').delete().eq('name', item.name),
      );
      await Promise.all(deletePromises);

      this._updateCart();
      this._totalPrice = 0;
      this._emitAreaChanged();
    }
  }

  /**
   * To add an item to the cart and remove it from the store inventory.
   *
   * @param itemName is the name of the item to be added to the cart
   * @param price is the price of the item to be added to the cart
   */
  private async _handleAddItem(itemName: string, price: number): Promise<void> {
    this._handleAddItemToCart(itemName, price);
    this._handleRemoveItemFromStoreInventory(itemName);
  }

  /**
   * To remove an item from the cart and add it back to the store inventory.
   *
   * @param itemName is the name of the item to be removed from the cart
   */
  private async _handleRemoveItem(itemName: string): Promise<void> {
    this._handleRemoveItemFromCart(itemName);
    this._handleAddItemToStoreInventory(itemName);
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
