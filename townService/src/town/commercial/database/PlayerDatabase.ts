import { PlayerID } from '../../../types/CoveyTownSocket';
import { MONEY_CANNOT_BE_NEGATIVE_ERROR, PLAYER_CART_NOT_FOUND_ERROR, PLAYER_INVENTORY_NOT_FOUND_ERROR } from '../errors';
import GroceryStoreItem from './GroceryStoreItem';
import GroceryStoreItemList from './GroceryStoreItemList';
import TradingOffer from './TradingOffer';

/**
 * PlayerDatabase is a class that stores the player's inventory, purchase history, and trading history.
 *
 * addToPlayerInventory() is a method that adds items to the player's inventory.
 * removeFromPlayerInventory() is a method that removes items from the player's inventory.
 * addToPlayerCart() is a method that add an item into player's cart
 * removeFromPlayerCart() is a method that remove an item from player's cart
 * addToPlayerPurchaseHistory() is a method that adds items to the player's purchase history.
 * addToPlayerTradingHistory() is a method that adds a past trading offer to the player's trading histroy.
 *
 * @param _playerInventory is a map that stores the player's inventory.
 * @param _playerPurchaseHistory is a map that stores the player's purchase history.
 * @param _playerTradingHistory is a map that stores the player's trading history.
 */
export default class PlayerDatabase {
  private _playerInventories = new Map<PlayerID, GroceryStoreItemList>();

  private _playerCarts = new Map<PlayerID, GroceryStoreItemList>();

  private _playerPurchaseHistories = new Map<PlayerID, Array<GroceryStoreItemList>>();

  private _playerTradingHistories = new Map<PlayerID, Array<TradingOffer>>();

  private _playerMoney = new Map<PlayerID, number>();

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
    const playerInventory = this._playerInventories.get(playerID);

    // If the player's inventory is found
    if (playerInventory) {
      playerInventory.addItemList(itemList);
    } else {
      this._playerInventories.set(playerID, itemList);
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
    const playerInventory = this._playerInventories.get(playerID);

    // If the player's inventory is found
    if (playerInventory) {
      playerInventory.removeItemList(itemList);
    } else {
      throw new Error(PLAYER_INVENTORY_NOT_FOUND_ERROR);
    }
  }

  /**
   * To add an item into player's cart
   *
   * @param playerID
   * @param itemList
   */
  public addToPlayerCart(playerID: PlayerID, item: GroceryStoreItem): void {
    // To find the player's cart
    let playerCart = this._playerCarts.get(playerID);

    // If the player's cart is found
    if (playerCart) {
      playerCart.addItem(item);
    } else {
      // Create cart for the player and add the item.
      playerCart = new GroceryStoreItemList();
      playerCart.addItem(item);
      this._playerCarts.set(playerID, playerCart);
    }
  }

  /**
   * To remove an item from a player's cart
   *
   * @param playerID
   * @param itemList
   */
  public removeFromPlayerCart(playerID: PlayerID, item: GroceryStoreItem): void {
    // To find the player's cart
    const playerCart = this._playerCarts.get(playerID);

    // If the player's cart is found
    if (playerCart) {
      playerCart.removeItem(item);
    } else {
      throw new Error(PLAYER_CART_NOT_FOUND_ERROR);
    }
  }

  /**
   * To add items to the player's purchase history.
   * If the player's purchase history is found, it adds the items to the player's purchase history.
   * If the player's purchase history is not found, it creates a new purchase history for the player and adds the items to the player's purchase history.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's purchase history.
   */
  public addToPlayerPurchaseHistory(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // If the player's purchase history is found, it adds the history to the player's purchase history.
    const playerPurchaseHistory = this._playerPurchaseHistories.get(playerID);

    // If the player's purchase history is found
    if (playerPurchaseHistory) {
      playerPurchaseHistory.push(itemList);
    } else {
      this._playerPurchaseHistories.set(playerID, [itemList]);
    }
  }

  /**
   * To add a past ttrading offer to the player's trading history
   *
   * @param playerID is the id of the player.
   * @param tradingOffer is the trading offer that the player did.
   */
  public addToPlayerTradingHistories(playerID: PlayerID, tradingOffer: TradingOffer): void {
    // If the player's trading history is found, it adds the history to the player
    const playerTradingHistory = this._playerTradingHistories.get(playerID);

    // If the player's trading history is found
    if (playerTradingHistory) {
      playerTradingHistory.push(tradingOffer);
    } else {
      this._playerTradingHistories.set(playerID, [tradingOffer]);
    }
  }

  /**
   * To add money to the player's money.
   * 
   * @param playerID is the id of the player.
   * @param money is the amount of money to be added to the player's money.
   */
  public addToPlayerMoney(playerID: PlayerID, money: number): void {
    if (money <= 0) {
      throw new Error(MONEY_CANNOT_BE_NEGATIVE_ERROR);
    }

    const currentMoney = this._playerMoney.get(playerID);

    if (currentMoney) {
      this._playerMoney.set(playerID, currentMoney + money);
    } else {
      this._playerMoney.set(playerID, money);
    }
  }

  /** TODO
   * To remove money from player's money.
   * The remove money amount cannot be negative.
   * The remove money amount cannot be greater than the player's money.
   * Throws an error if the remove money amount is negative or greater than the player's money.
   * Throws an error if the player's money is not found.
   * 
   * @param playerID 
   * @param money 
   */
  public removeFromPlayerMoeny(playerID: PlayerID, money: number): void {
  }
}
