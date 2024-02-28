import { MODIFY_ITEM_QUANTITY_ERROR, NEGATIVE_ITEM_QUANTITY_ERROR } from '../errors';
import { GroceryStoreItemName, groceryStoreItemPrices } from '../types';

/**
 * GroceryStoreItem is an abstarct class that represents a grocery store item.
 */
export default class GroceryStoreItem {
  private _itemName: GroceryStoreItemName;

  private _price: number;

  private _quantity: number;

  constructor(name: GroceryStoreItemName, quantity?: number) {
    this._itemName = name;
    this._price = groceryStoreItemPrices[name];
    this._quantity = quantity || 0;
  }

  /**
   * To get the name of the item.
   */
  public getName(): GroceryStoreItemName {
    return this._itemName;
  }

  /**
   * To get the price of the item.
   */
  public getPrice(): number {
    return this._price;
  }

  /**
   * To get the quantity of the item.
   */
  public getQuantity(): number {
    return this._quantity;
  }

  /**
   * To get the value of the item (price * quantity).
   */
  public getValue(): number {
    return this._price * this._quantity;
  }

  /**
   * If the item is the item we are looking for, return true.
   */
  public isItem(itemName: GroceryStoreItemName): boolean {
    return this._itemName === itemName;
  }

  /**
   * To add quantity to the item.
   *
   * @param quantity is the quantity to be added to the item.
   */
  public addQuantity(quantity: number): void {
    // If the quantity is not positive, throw an error.
    if (quantity <= 0) throw new Error(MODIFY_ITEM_QUANTITY_ERROR); // TODO
    this._quantity += quantity;
  }

  /**
   * To remove quantity to the item.
   *
   * @param quantity
   */
  public removeQuantity(quantity: number): void {
    // If the quantity is not positive, throw an error.
    if (quantity <= 0) throw new Error(MODIFY_ITEM_QUANTITY_ERROR);
    // If the quantity is greater than the current quantity, throw an error.
    if (quantity > this._quantity) throw new Error(NEGATIVE_ITEM_QUANTITY_ERROR);
    this._quantity -= quantity;
  }
}
