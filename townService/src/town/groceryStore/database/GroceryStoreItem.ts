import { MODIFY_ITEM_QUANTITY_ERROR, NEGATIVE_ITEM_QUANTITY_ERROR } from '../errors';
import { GroceryStoreItemName, groceryStoreItemPrices } from '../types';

/**
 * GroceryStoreItem is a class that represents a grocery store item.
 *
 * isItem() is a method that checks if the item is the item we are looking for.
 * addQuantity() is a method that adds quantity to the item.
 * removeQuantity() is a method that removes quantity to the item.
 *
 * @param _itemName is the name of the item.
 * @param _price is the price of the item.
 * @param _quantity is the quantity of the item.
 */
export default class GroceryStoreItem {
  private _itemName: GroceryStoreItemName;

  private _price: number;

  private _quantity: number;

  constructor(name: GroceryStoreItemName, quantity?: number) {
    this._itemName = name;
    this._price = groceryStoreItemPrices[name as keyof typeof groceryStoreItemPrices];
    this._quantity = quantity || 0;
  }

  public get itemName(): GroceryStoreItemName {
    return this._itemName;
  }

  public get price(): number {
    return this._price;
  }

  public get quantity(): number {
    return this._quantity;
  }

  public get itemTotalValue(): number {
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
   * Throws an error if the quantity is not positive, since you cannot add a negative quantity or 0 to the item.
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
   * Throws an error if the quantity is not positive, since you cannot remove a negative quantity or 0 to the item.
   * Throws an error if the quantity is greater than the current quantity, since you cannot remove more than the current quantity.
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
