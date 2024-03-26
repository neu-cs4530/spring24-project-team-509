import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { supabase } from 'covey-town/src/supabaseClient';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  GroceryStoreArea as GroceryStoreAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import Player from '../lib/Player';

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
    if (command.type === 'AddToCart') {
      console.log(`Adding item to cart: ${command.itemName} and ${command.price}`);
    }
    if (command.type === 'RemoveFromCart') {
      console.log(`Removing item from cart: ${command.itemName}`);
    }
    throw new Error('Invalid command');
  }

  async handleCalculateTotalPrice(): Promise<number> {
    let totalPrice = 0;
    const { data } = await supabase.from('storeCart').select();
    if (data && data.length > 0) {
      totalPrice = data.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    }
    return totalPrice;
  }

  async handleAddItemToCart(itemName: string, price: number): Promise<void> {
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

  async handleRemoveItemFromCart(itemName: string): Promise<void> {
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

  async handleAddItemToStoreInventory(itemName: string): Promise<void> {
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

  async handleRemoveItemFromStoreInventory(itemName: string): Promise<void> {
    const { data } = await supabase.from('StoreInventory').select().eq('name', itemName);

    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('StoreInventory')
        .update({ quantity: item.quantity - 1 })
        .eq('name', itemName);
    }
  }

  async handleAddItem(itemName: string, price: number): Promise<void> {
    this.handleAddItemToCart(itemName, price);
    this.handleRemoveItemFromStoreInventory(itemName);
  }

  async handleRemoveItem(itemName: string): Promise<void> {
    this.handleRemoveItemFromCart(itemName);
    this.handleAddItemToStoreInventory(itemName);
  }
}
