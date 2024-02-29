import { ITEM_NOT_FOUND_ERROR, NEGATIVE_ITEM_QUANTITY_ERROR } from '../errors';
import { GroceryStoreItemName } from '../types';
import GroceryStoreItem from './GroceryStoreItem';

/**
 * groceryStoreItem is an abstarct class that represents a grocery store item.
 */
export default class GroceryStoreItemList {
  itemList: GroceryStoreItem[];

  constructor(itemList?: GroceryStoreItem[]) {
    this.itemList = itemList || [];
  }

  /**
   * Get the item list.
   *
   * @returns the item list.
   */
  public getItemList(): GroceryStoreItem[] {
    return this.itemList;
  }

  /**
   * To add an item to the list.
   * If the item is already in the list, it adds to the quantity of the item.
   * If the item is not in the list, it adds the item to the list.
   */
  public addItem(itemName: GroceryStoreItemName, quantity?: number): void {
    const item = this.itemList.find(element => element.isItem(itemName));
    // If the item is already in the list
    if (item) {
      item.addQuantity(quantity || 1);
    }
    // If the item is not in the list
    else {
      // add the item to the list
      this.itemList.push(new GroceryStoreItem(itemName, quantity || 1));
    }
  }

  /**
   * To remove an item from the list.
   * If the item is already in the list, it remove to the quantity of the item.
   * If the quantity is larger than the item stock, throw an error.
   * If the item is reduced to 0, it removes the item from the list.
   * If the item is not in the list, it throws an error.
   */
  public removeItem(itemName: GroceryStoreItemName, quantity?: number): void {
    const item = this.itemList.find(element => element.isItem(itemName));

    // If the item is already in the list
    if (item) {
      // If the quantity is larger than the item stock, throw an error
      if (item.getQuantity() - (quantity || 1) < 0) {
        throw new Error(NEGATIVE_ITEM_QUANTITY_ERROR);
      }
      // If the quantity is reduced to 0, remove the item from the list
      else if (item.getQuantity() - (quantity || 1) === 0) {
        this.itemList = this.itemList.filter(element => !element.isItem(itemName));
      }
      // Else remove the quantity from the item
      else {
        item.removeQuantity(quantity || 1);
      }
    } else {
      throw new Error(ITEM_NOT_FOUND_ERROR);
    }
  }

  /**
   * To get the value of the entire item list (price * quantity).
   */
  public getTotalValue(): number {
    // TODO
    throw new Error('Not implemented');
  }
}
