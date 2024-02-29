import GroceryStoreItemList from './GroceryStoreItemList';

/**
 * PlayerDatabase
 */
export default abstract class PlayerDatabase {
  private _playerInventory = new Map<string, GroceryStoreItemList>();

  private _playerPurchaseHistory = new Map<string, Array<GroceryStoreItemList>>();

  private _playerTradingHistory = new Map<string, Array<GroceryStoreItemList>>();

  /**
   * To add items to the player's inventory.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's inventory.
   */
  protected _addToPlayerInventory(playerID: string, itemList: GroceryStoreItemList): void {
    const playerInventory = this._playerInventory.get(playerID);
    if (playerInventory) {
      playerInventory.addItemList(itemList);
    } else {
      this._playerInventory.set(playerID, itemList);
    }
  }

  // TODO: purchase history functions
}
