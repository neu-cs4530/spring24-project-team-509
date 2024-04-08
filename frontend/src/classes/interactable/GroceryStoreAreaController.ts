import {
  GroceryStoreArea as GroceryStoreAreaModel,
  InteractableID,
  GroceryItem,
} from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  GROCERY_AREA_TYPE,
} from './InteractableAreaController';
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

  protected _storeInventory: GroceryItem[] = [];

  protected _totalBalance = 0;

  protected _cart: GroceryItem[] = [];

  protected _history: GroceryItem[] = [];

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
      cart: this._cart,
      balance: this._totalBalance,
      history: this._history,
    };
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  get balance(): number {
    return this._totalBalance;
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

  get storeInventory(): GroceryItem[] {
    return this._storeInventory;
  }

  get cart(): GroceryItem[] {
    return this._cart;
  }

  get history(): GroceryItem[] {
    return this._history;
  }

  protected _updateFrom(updatedModel: GroceryStoreAreaModel): void {
    this._totalPrice = updatedModel.totalPrice;
    this._storeInventory = updatedModel.storeInventory;
    this._cart = updatedModel.cart;
    this._totalBalance = updatedModel.balance;
    this._history = updatedModel.history;
    console.log('grocConroller updates', this._history, this._storeInventory);
    this.emit('groceryStoreAreaUpdated');
  }

  /**
   * To open the grocery store.
   * To initialize the store inventory and cart.
   */
  public async handleOpenGroceryStore(): Promise<void> {
    try {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'OpenGroceryStore',
      });
    } catch (e) {
      console.log('controller error');
    }
  }

  public async handleCheckout(): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'CheckOut',
    });
  }

  /**
   * To add an item to the cart and remove it from the store inventory.
   *
   * @param itemName is the name of the item to be added to the cart
   * @param price is the price of the item to be added to the cart
   */
  public async handleAddItem(itemName: string, price: number): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
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
    await this._townController.sendInteractableCommand(this.id, {
      type: 'RemoveFromCart',
      itemName: itemName,
    });
  }
}
