import { ITEM_NOT_FOUND_ERROR, NEGATIVE_ITEM_QUANTITY_ERROR } from '../errors';
import { GroceryStoreItemName } from '../types';
import GroceryStoreItem from './GroceryStoreItem';

/**
 * groceryStoreItem is an abstarct class that represents a grocery store item.
 *
 * getItemListTotalValue() is a method that gets the total value of the items in the list.
 * isEquals() is a method that checks if the item is equal to another item.
 * addItemWithQuantity() is a method that adds an item to the list using item name and quantity.
 * addItem() is a method that adds an item to the list.
 * addItemList() is a method that adds a list of items to the list.
 * removeItemWithQuantity() is a method that removes an item from the list.
 * removeItem() is a method that removes an item from the list.
 * removeItemList() is a method that removes a list of items from the list.
 *
 * @param _itemList is the list of items.
 */
export default class GroceryStoreItemList {
  private _itemList: GroceryStoreItem[];

  constructor(itemList?: GroceryStoreItem[]) {
    this._itemList = itemList || [];
  }

  public get itemList(): GroceryStoreItem[] {
    return this._itemList;
  }

  /**
   * To get the total value of the items in the list.
   *
   * @returns the total value of the items in the list.
   */
  public getItemListTotalValue(): number {
    return this._itemList.reduce((acc, item) => acc + item.itemTotalValue, 0);
  }

  /**
   * If the list is empty.
   *
   * @returns true if the list is empty, else false.
   */
  public isEmpty(): boolean {
    return this._itemList.length === 0;
  }

  /**
   * To add an item to the list using item name and quantity.
   * If the item is already in the list, it adds to the quantity of the item.
   * If the item is not in the list, it adds the item to the list.
   */
  public addItemWithQuantity(itemName: GroceryStoreItemName, quantity?: number): void {
    // To find the item in the list
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
   * To add an item to the list.
   */
  public addItem(itemToAdd: GroceryStoreItem): void {
    this.addItemWithQuantity(itemToAdd.name, itemToAdd.quantity);
  }

  /**
   * To add a list of items to the list.
   */
  public addItemList(itemList: GroceryStoreItemList): void {
    itemList.itemList.forEach(item => {
      this.addItem(item);
    });
  }

  /**
   * To remove an item from the list based on the item name and quantity.
   * If the quantity is not provided, it removes 1 item from the list.
   * If the quantity is larger than the item stock, it throws an error.
   * If the quantity is reduced to 0, it removes the item from the list.
   * Else it removes the quantity from the item.
   * If the item is not in the list, it throws an error.
   */
  public removeItemWithQuantity(itemName: GroceryStoreItemName, quantity?: number): void {
    // To find the item in the list
    const item = this.itemList.find(element => element.isItem(itemName));

    // If the item is already in the list
    if (item) {
      // If the quantity is larger than the item stock, throw an error
      if (item.quantity - (quantity || 1) < 0) {
        throw new Error(NEGATIVE_ITEM_QUANTITY_ERROR);
      }
      // If the quantity is reduced to 0, remove the item from the list
      else if (item.quantity - (quantity || 1) === 0) {
        this._itemList = this._itemList.filter(element => !element.isItem(itemName));
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
   * To remove an item from the list.
   *
   * @param itemToRemove is the item to be removed from the list.
   */
  public removeItem(itemToRemove: GroceryStoreItem): void {
    this.removeItemWithQuantity(itemToRemove.name, itemToRemove.quantity);
  }

  /**
   * To remove a list of items from the list.
   *
   * @param itemList is the list of items to be removed from the list.
   */
  public removeItemList(itemList: GroceryStoreItemList): void {
    itemList.itemList.forEach(item => {
      this.removeItem(item);
    });
  }
}
