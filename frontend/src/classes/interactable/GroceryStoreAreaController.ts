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

  protected _totalPrice = 0;

  protected _storeInventory: any[] = [];

  // protected _cart: any[] = [];

  constructor(id: InteractableID, townController: TownController) {
    super(id);
    this._townController = townController;
  }

  toInteractableAreaModel(): GroceryStoreAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'GroceryStoreArea',
      totalPrice: this._totalPrice,
      storeInventory: this._storeInventory,
      // cart: this._cart,
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

  get totalPrice(): number {
    return this._totalPrice;
  }

  get storeInventory(): any[] {
    return this._storeInventory;
  }

  // get cart(): any[] {
  //   return this._cart;
  // }

  protected _updateFrom(updatedModel: GroceryStoreAreaModel): void {
    if (updatedModel.totalPrice !== this._totalPrice) {
      this._totalPrice = updatedModel.totalPrice;
      this.emit('groceryStoreAreaUpdated');
    }
    if (updatedModel.storeInventory !== this._storeInventory) {
      this._storeInventory = updatedModel.storeInventory;
      this.emit('groceryStoreAreaUpdated');
    }
  }

  public handleOpenGroceryStore(): void {
    this._townController.sendInteractableCommand(this.id, {
      type: 'OpenGroceryStore',
    });
  }

  /**
   * To add an item to the cart and remove it from the store inventory.
   *
   * @param itemName is the name of the item to be added to the cart
   * @param price is the price of the item to be added to the cart
   */
  public async handleAddItem(itemName: string, price: number): Promise<void> {
    this._townController.sendInteractableCommand(this.id, {
      type: 'AddToCart',
      itemName: itemName,
      price: price,
    });
  }

  /**
   * To remove an item from the cart and add it back to the store inventory.
   *
   * @param itemName is the name of the item to be removed from the cart
   */
  public async handleRemoveItem(itemName: string): Promise<void> {
    this._townController.sendInteractableCommand(this.id, {
      type: 'RemoveFromCart',
      itemName: itemName,
    });
  }
}
