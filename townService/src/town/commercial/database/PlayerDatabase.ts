import { PlayerID } from '../../../types/CoveyTownSocket';
import { PLAYER_INVENTORY_NOT_FOUND_ERROR } from '../errors';
import GroceryStoreItemList from './GroceryStoreItemList';

/**
 * PlayerDatabase is a class that stores the player's inventory, purchase history, and trading history.
 *
 * _addToPlayerInventory() is a method that adds items to the player's inventory.
 * _removeFromPlayerInventory() is a method that removes items from the player's inventory.
 * _addToPlayerPurchaseHistory() is a method that adds items to the player's purchase history.
 *
 * @param _playerInventory is a map that stores the player's inventory.
 * @param _playerPurchaseHistory is a map that stores the player's purchase history.
 * @param _playerTradingHistory is a map that stores the player's trading history.
 */
export default class PlayerDatabase {
  private _playerInventory = new Map<PlayerID, GroceryStoreItemList>();

  private _playerCart = new Map<PlayerID, Array<GroceryStoreItemList>>();

  private _playerPurchaseHistory = new Map<PlayerID, Array<GroceryStoreItemList>>();

  private _playerTradingHistory = new Map<PlayerID, Array<GroceryStoreItemList>>();

  /**
   * To add items to the player's inventory.
   * If the player's inventory is found, it adds the items to the player's inventory.
   * If the player's inventory is not found, it creates a new inventory for the player and adds the items to the player's inventory.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's inventory.
   */
  public addToPlayerInventory(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To find the player's inventory
    const playerInventory = this._playerInventory.get(playerID);

    // If the player's inventory is found
    if (playerInventory) {
      playerInventory.addItemList(itemList);
    } else {
      this._playerInventory.set(playerID, itemList);
    }
  }

  /**
   * To remove items from the player's inventory.
   * If the player's inventory is found, it removes the items from the player's inventory.
   * If the player's inventory is not found, it throws an error.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be removed from the player's inventory.
   */
  public removeFromPlayerInventory(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To find the player's inventory
    const playerInventory = this._playerInventory.get(playerID);

    // If the player's inventory is found
    if (playerInventory) {
      playerInventory.removeItemList(itemList);
    } else {
      throw new Error(PLAYER_INVENTORY_NOT_FOUND_ERROR);
    }
  }

  /** TODO: krishna
   *
   * @param playerID
   * @param itemList
   */
  public addToPlayerCart(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To find the player's cart
    const playerCart = this._playerCart.get(playerID);

    // If the player's cart is found
    if (playerCart) {
      playerCart.push(itemList);
    } else {
      this._playerCart.set(playerID, [itemList]);
    }
  }

  /** TODD: krishna
   *
   * @param playerID
   * @param itemList
   */
  public removeFromPlayerCart(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To find the player's cart
    const playerCart = this._playerCart.get(playerID);

    // If the player's cart is found
    if (playerCart) {
      playerCart.pop();
    } else {
      throw new Error(PLAYER_INVENTORY_NOT_FOUND_ERROR);
    }
  }

  /** TODO
   * To add items to the player's purchase history.
   * If the player's purchase history is found, it adds the items to the player's purchase history.
   * If the player's purchase history is not found, it creates a new purchase history for the player and adds the items to the player's purchase history.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's purchase history.
   */
  public _addToPlayerPurchaseHistory(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // If the player's purchase history is found, it adds the items to the player's purchase history.
    const playerPurchaseHistory = this._playerPurchaseHistory.get(playerID);

    // If the player's purchase history is found
    if (playerPurchaseHistory) {
      playerPurchaseHistory.push(itemList);
    } else {
      this._playerPurchaseHistory.set(playerID, [itemList]);
    }
  }
}
