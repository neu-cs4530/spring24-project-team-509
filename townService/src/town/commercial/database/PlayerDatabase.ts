import { PlayerID } from '../../../types/CoveyTownSocket';
import { PLAYER_CART_NOT_FOUND_ERROR, PLAYER_INVENTORY_NOT_FOUND_ERROR } from '../errors';
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
   * To add an item to the player's inventory.
   * If the player's inventory is found, it adds the item to the player's inventory.
   * If the player's inventory is not found, it creates a new inventory for the player and adds the item to the player's inventory.
   *
   * @param playerID is the id of the player.
   * @param item is the item to be added to the player's inventory.
   */
  public addItemToPlayerInventory(playerID: PlayerID, item: GroceryStoreItem): void {
    // To find the player's inventory
    const playerInventory = this._playerInventories.get(playerID);

    // If the player's inventory is found
    if (playerInventory) {
      playerInventory.addItem(item);
    } else {
      const newInventory = new GroceryStoreItemList();
      newInventory.addItem(item);
      this._playerInventories.set(playerID, newInventory);
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
   * To remove an item from the player's inventory.
   * If the player's inventory is found, it removes the item from the player's inventory.
   * If the player's inventory is not found, it throws an error.
   *
   * @param playerID is the id of the player.
   * @param item is the item to be removed from the player's inventory.
   */
  public removeItemFromPlayerInventory(playerID: PlayerID, item: GroceryStoreItem): void {
    // To find the player's inventory
    const playerInventory = this._playerInventories.get(playerID);

    // If the player's inventory is found
    if (playerInventory) {
      playerInventory.removeItem(item);
    } else {
      throw new Error(PLAYER_INVENTORY_NOT_FOUND_ERROR);
    }
  }

  /**
    * To get the player's inventory.
    * If the player's inventory is found, it returns the inventory.
    * If the player's inventory is not found, it returns an empty inventory.
    *
    * @param playerID is the id of the player.
    * @returns the player's inventory.
    */
    public getPlayerInventory(playerID: PlayerID): GroceryStoreItemList {
     // To find the player's inventory
     const playerInventory = this._playerInventories.get(playerID);

     // If the player's inventory is found, return the inventory
     if (playerInventory) {
      return playerInventory;
     }

     // If the player's inventory is not found, return an empty inventory
     return new GroceryStoreItemList();
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
   * To get the player's cart.
   * If the player's cart is found, it returns the cart.
   * If the player's cart is not found, it returns an empty cart.
   *
   * @param playerID is the id of the player.
   * @returns the player's cart.
   */
  public getPlayerCart(playerID: PlayerID): GroceryStoreItemList {
    // To find the player's cart
    const playerCart = this._playerCarts.get(playerID);

    // If the player's cart is found, return the cart
    if (playerCart) {
      return playerCart;
    }

    // If the player's cart is not found, return an empty cart
    return new GroceryStoreItemList();
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
   * To get the player's trading history.
   * If the player's trading history is found, it returns the trading history.
   * If the player's trading history is not found, it returns an empty trading history.
   *
   * @param playerID is the id of the player.
   * @returns the player's trading history.
   */
  public getPlayerTradingHistories(playerID: PlayerID): Array<TradingOffer> {
    // To find the player's trading history
    const playerTradingHistory = this._playerTradingHistories.get(playerID);

    // If the player's trading history is found, return the trading history
    if (playerTradingHistory) {
      return playerTradingHistory;
    }

    // If the player's trading history is not found, return an empty trading history
    return [];
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
    // To find the player's purchase history
    const playerPurchaseHistory = this._playerPurchaseHistories.get(playerID);

    // If the player's purchase history is found
    if (playerPurchaseHistory) {
      playerPurchaseHistory.push(itemList);
    } else {
      this._playerPurchaseHistories.set(playerID, [itemList]);
    }
  }

  /**
   * To get the player's purchase history.
   * If the player's purchase history is found, it returns the purchase history.
   * If the player's purchase history is not found, it returns an empty purchase history.
   *
   * @param playerID is the id of the player.
   * @returns the player's purchase history.
   */
  public getPlayerPurchaseHistory(playerID: PlayerID): Array<GroceryStoreItemList> {
    // To find the player's purchase history
    const playerPurchaseHistory = this._playerPurchaseHistories.get(playerID);

    // If the player's purchase history is found, return the purchase history
    if (playerPurchaseHistory) {
      return playerPurchaseHistory;
    }

    // If the player's purchase history is not found, return an empty purchase history
    return [];
  }
  
}
