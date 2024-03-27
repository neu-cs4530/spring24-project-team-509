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

  /** TODO:
   * To find the total price of the items in the cart.
   *
   * @returns the total price of the items in the cart.
   */
  async handleCalculateTotalPrice(): Promise<number> {
    // const totalPrice = this._townController.sendInteractableCommand(this.id, {
    //   type: 'CalculateTotalCartPrice',
    // });
    let totalPrice = 0;
    const { data } = await supabase.from('storeCart').select();
    if (data && data.length > 0) {
      totalPrice = data.reduce((acc: number, item: any) => {
        return acc + item.price * item.quantity;
      }, 0);
    }
    return totalPrice;
  }

  /**
   * To add an item to the cart and remove it from the store inventory.
   *
   * @param itemName is the name of the item to be added to the cart
   * @param price is the price of the item to be added to the cart
   */
  async handleAddItem(itemName: string, price: number): Promise<void> {
    this._townController.sendInteractableCommand(this.id, {
      type: 'AddToCart',
      itemName: itemName,
      price: price,
    });
    this.emit('groceryStoreAreaUpdated');
  }

  /**
   * To remove an item from the cart and add it back to the store inventory.
   *
   * @param itemName is the name of the item to be removed from the cart
   */
  async handleRemoveItem(itemName: string): Promise<void> {
    this._townController.sendInteractableCommand(this.id, {
      type: 'RemoveFromCart',
      itemName: itemName,
    });
    this.emit('groceryStoreAreaUpdated');
  }

  /** TODO:
   * To fetch the store inventory.
   */
  async fetchStoreInventory(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  /** TODO:
   * To fetch the cart.
   */
  async fetchCart(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
