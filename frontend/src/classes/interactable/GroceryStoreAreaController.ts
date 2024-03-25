import { GroceryStoreArea as GroceryStoreAreaModel } from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  GROCERY_AREA_TYPE,
} from './InteractableAreaController';
import { supabase } from '../../supabaseClient';

export type GroceryStoreAreaEvents = BaseInteractableEventMap & {
  groceryStoreAreaUpdated: () => void;
};

export default class GroceryStoreAreaController extends InteractableAreaController<
  GroceryStoreAreaEvents,
  GroceryStoreAreaModel
> {
  toInteractableAreaModel(): GroceryStoreAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'GroceryStoreArea',
    };
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  get type(): string {
    return GROCERY_AREA_TYPE;
  }

  get friendlyName(): string {
    return this.id;
  }

  protected _updateFrom(updatedModel: GroceryStoreAreaModel): void {
    // No updates to make
    this.emit('groceryStoreAreaUpdated');
  }

  async handleCalculateTotalPrice(): Promise<number> {
    let totalPrice = 0;
    const { data } = await supabase.from('storeCart').select();
    if (data && data.length > 0) {
      totalPrice = data.reduce((acc: number, item: any) => {
        return acc + item.price * item.quantity;
      }, 0);
    }
    return totalPrice;
  }

  async handleReduceItemFromCart(itemName: string): Promise<void> {
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

  async handleAddItemToInventory(itemName: string): Promise<void> {
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

  async handleReturnItem(itemName: string): Promise<void> {
    this.handleReduceItemFromCart(itemName);
    this.handleAddItemToInventory(itemName);
    this.emit('groceryStoreAreaUpdated');
  }

  async handleRemoveItemFromInventory(itemName: string): Promise<void> {
    const { data } = await supabase.from('StoreInventory').select().eq('name', itemName);

    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('StoreInventory')
        .update({ quantity: item.quantity - 1 })
        .eq('name', itemName);
    }
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
      await supabase.from('storeCart').insert([{ name: itemName, price: price, quantity: 1 }]);
    }
  }

  async handleAddItem(itemName: string, price: number): Promise<void> {
    this.handleAddItemToCart(itemName, price);
    this.handleRemoveItemFromInventory(itemName);
    this.emit('groceryStoreAreaUpdated');
  }
}
