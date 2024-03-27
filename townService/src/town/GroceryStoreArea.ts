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
  public constructor(
    { id }: Omit<GroceryStoreAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  public toModel(): GroceryStoreAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'GroceryStoreArea',
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
    return new GroceryStoreArea({ id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'CalculateTotalCartPrice') {
      const totalPrice = this._handleCalculateTotalPrice();
      return totalPrice as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'AddToCart') {
      this._handleAddItem(command.itemName, command.price);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'RemoveFromCart') {
      this._handleRemoveItem(command.itemName);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Invalid command');
  }

  /**
   * To find the total price of the items in the cart.
   * To do this, we first fetch the items in the cart.
   * Then we calculate the total price of the items in the cart.
   *
   * @returns the total price of the items in the cart.
   */
  private async _handleCalculateTotalPrice(): Promise<number> {
    let totalPrice = 0;
    const { data } = await supabase.from('storeCart').select();
    if (data && data.length > 0) {
      totalPrice = data.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    }
    return totalPrice;
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

  /** TODO:
   * To fetch the store inventory.
   */
  private async _fetchStoreInventory(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  /** TODO:
   * To fetch the cart.
   */
  private async _fetchCart(): Promise<any> {
    throw new Error('Method not implemented.');
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
  }
}
