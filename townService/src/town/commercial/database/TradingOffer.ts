import GroceryStoreItemList from './GroceryStoreItemList';

/**
 * TradingOffer is a trading offer that a player initiated.
 * TradingOffer contains a list of items the player is giving out.
 * TradingOffer contains a list of items the player wants.
 */
export default class TradingOffer {
  private _itemsYouHave: GroceryStoreItemList;

  private _itemsYouWant: GroceryStoreItemList;

  constructor(itemsYouHave: GroceryStoreItemList, itemsYouWant: GroceryStoreItemList) {
    this._itemsYouHave = itemsYouHave;
    this._itemsYouWant = itemsYouWant;
  }
}
