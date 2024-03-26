import {
  GroceryStoreArea,
  GroceryStoreArea as GroceryStoreAreaModel,
  InteractableID,
} from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  GROCERY_AREA_TYPE,
} from './InteractableAreaController';
import { supabase } from '../../supabaseClient';
import TownController from '../TownController';

export type GroceryStoreAreaEvents = BaseInteractableEventMap & {
  groceryStoreAreaUpdated: () => void;
};

export default class GroceryStoreAreaController extends InteractableAreaController<
  GroceryStoreAreaEvents,
  GroceryStoreAreaModel
> {
  protected _townController: TownController;

  constructor(id: InteractableID, townController: TownController) {
    super(id);
    this._townController = townController;
  }

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
    this._townController.sendInteractableCommand(this.id, {
      type: 'AddToCart',
      itemName: itemName,
      price: price,
    });
    // this.handleAddItemToCart(itemName, price);
    // this.handleRemoveItemFromStoreInventory(itemName);
    // this.emit('groceryStoreAreaUpdated');
  }

  async handleRemoveItem(itemName: string): Promise<void> {
    this._townController.sendInteractableCommand(this.id, {
      type: 'RemoveFromCart',
      itemName: itemName,
    });
    // this.handleRemoveItemFromCart(itemName);
    // this.handleAddItemToStoreInventory(itemName);
    // this.emit('groceryStoreAreaUpdated');
  }
}
