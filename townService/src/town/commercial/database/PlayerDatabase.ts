import { PlayerID } from '../../../types/CoveyTownSocket';
import {
  ITEM_LIST_EMPTY_ERROR,
  PLAYER_CART_NOT_FOUND_ERROR,
  PLAYER_INSUFFICIENT_FUNDS_ERROR,
  PLAYER_INVENTORY_NOT_FOUND_ERROR,
} from '../errors';
import GroceryStoreItem from './GroceryStoreItem';
import GroceryStoreItemList from './GroceryStoreItemList';
import TradingOffer from './TradingOffer';

/**
 * PlayerDatabase is a class that stores the player's inventory, purchase history, and trading history.
 *
 * @param _playerInventory is a map that stores the player's inventory.
 * @param _playerCart is a map that stores the player's cart.
 * @param _playerPurchaseHistory is a map that stores the player's purchase history.
 * @param _playerTradingHistory is a map that stores the player's trading history.
 * @param _playerBalances is a map that stores the player's balance.
 */
export default class PlayerDatabase {
  private _playerInventories = new Map<PlayerID, GroceryStoreItemList>();

  private _playerCarts = new Map<PlayerID, GroceryStoreItemList>();

  private _playerPurchaseHistories = new Map<PlayerID, Array<GroceryStoreItemList>>();

  private _playerTradingHistories = new Map<PlayerID, Array<TradingOffer>>();

  private _playerBalances = new Map<PlayerID, number>();

  // /////////////////////////////////////////////////////////////////////////////////////////
  // Getters and Setters for playerInventories
  public get playerInventories(): Map<PlayerID, GroceryStoreItemList> {
    return this._playerInventories;
  }

  public set playerInventories(playerInventories: Map<PlayerID, GroceryStoreItemList>) {
    this._playerInventories = playerInventories;
  }

  // Getters and Setters for playerCarts
  public get playerCarts(): Map<PlayerID, GroceryStoreItemList> {
    return this._playerCarts;
  }

  public set playerCarts(playerCarts: Map<PlayerID, GroceryStoreItemList>) {
    this._playerCarts = playerCarts;
  }

  // Getters and Setters for playerPurchaseHistories
  public get playerPurchaseHistories(): Map<PlayerID, Array<GroceryStoreItemList>> {
    return this._playerPurchaseHistories;
  }

  public set playerPurchaseHistories(
    playerPurchaseHistories: Map<PlayerID, Array<GroceryStoreItemList>>,
  ) {
    this._playerPurchaseHistories = playerPurchaseHistories;
  }

  // Getters and Setters for playerTradingHistories
  public get playerTradingHistories(): Map<PlayerID, Array<TradingOffer>> {
    return this._playerTradingHistories;
  }

  public set playerTradingHistories(playerTradingHistories: Map<PlayerID, Array<TradingOffer>>) {
    this._playerTradingHistories = playerTradingHistories;
  }

  // Getters and Setters for playerBalances
  public get playerBalances(): Map<PlayerID, number> {
    return this._playerBalances;
  }

  public set playerBalances(playerBalances: Map<PlayerID, number>) {
    this._playerBalances = playerBalances;
  }

  // /////////////////////////////////////////////////////////////////////////////////////////
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
    this._playerInventories.set(playerID, new GroceryStoreItemList());
    return new GroceryStoreItemList();
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
    }
    // If the player's inventory is not found, create a new inventory for the player and add the item to the player's inventory
    else {
      const newInventory = new GroceryStoreItemList();
      newInventory.addItem(item);
      this._playerInventories.set(playerID, newInventory);
    }
  }

  /**
   * To add items to the player's inventory.
   * Iterate through the itemList and add each item to the player's inventory.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's inventory.
   */
  public addToPlayerInventory(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To check if the itemList is empty
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    itemList.itemList.forEach(item => {
      this.addItemToPlayerInventory(playerID, item);
    });
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
   * To remove items from the player's inventory.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be removed from the player's inventory.
   */
  public removeFromPlayerInventory(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To check if the itemList is empty
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    itemList.itemList.forEach(item => {
      this.removeItemFromPlayerInventory(playerID, item);
    });
  }

  // /////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Sarah & Krish
   * To return all items in the player cart
   * @param playerID is the id of the player
   * @returns the player cart
   */
  public getPlayerCart(playerID: PlayerID): GroceryStoreItemList {
    // To find the player's cart
    const playerCart = this._playerCarts.get(playerID);

    // If the player's cart is found
    if (playerCart) {
      return playerCart;
    }

    // If the player's cart is not found, return an empty cart
    this._playerCarts.set(playerID, new GroceryStoreItemList());
    return new GroceryStoreItemList();
  }

  /**
   * To add an item into player's cart
   *
   * @param playerID
   * @param itemList
   */
  public addItemToPlayerCart(playerID: PlayerID, item: GroceryStoreItem): void {
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
   * To add items to the player's cart.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's cart.
   */
  public addToPlayerCart(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To check if the itemList is empty
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    itemList.itemList.forEach(item => {
      this.addItemToPlayerCart(playerID, item);
    });
  }

  /**
   * To remove an item from the player's cart
   *
   * @param playerID is the id of the player
   * @param item is the item to be removed from the player's cart
   */
  public removeItemFromPlayerCart(playerID: PlayerID, item: GroceryStoreItem): void {
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
   * To remove an item list from a player's cart
   *
   * @param playerID
   * @param itemList
   */
  public removeFromPlayerCart(playerID: PlayerID, itemList: GroceryStoreItemList): void {
    // To check if the itemList is empty
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    itemList.itemList.forEach(item => {
      this.removeItemFromPlayerCart(playerID, item);
    });
  }

  /**
   * Sarah & Krish
   * To clear all the contents of the player cart
   * @param playerID is the id of the player
   */
  public clearPlayerCart(playerId: PlayerID): void {
    this._playerCarts.set(playerId, new GroceryStoreItemList());

    // const playerCart = this._playerCarts.get(playerId);
    // if (playerCart) {
    //   //Iterate through each item in the player's cart and remove it
    //   for (let i = 0; i < playerCart.itemList.length; i++) {
    //     playerCart.removeItem(playerCart.itemList[i]);
    //   }

    // } else {
    //   throw new Error(PLAYER_CART_NOT_FOUND_ERROR);
    // }
  }

  // /////////////////////////////////////////////////////////////////////////////////////////
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
    this._playerPurchaseHistories.set(playerID, []);
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
    // To check if the itemList is empty
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    // To find the player's purchase history
    const playerPurchaseHistory = this._playerPurchaseHistories.get(playerID);

    // If the player's purchase history is found
    if (playerPurchaseHistory) {
      playerPurchaseHistory.push(itemList);
    } else {
      this._playerPurchaseHistories.set(playerID, [itemList]);
    }
  }

  // /////////////////////////////////////////////////////////////////////////////////////////
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
    this._playerTradingHistories.set(playerID, []);
    return [];
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

  // /////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Sarah & Krish
   * To get the current balance of the player
   * @param playerID is the id of the player
   */
  public getPlayerBalance(playerID: PlayerID): number {
    // To find the player's balance
    const playerBalance = this._playerBalances.get(playerID);

    // If the player's balance is found, return the balance
    if (playerBalance) {
      return playerBalance;
    }

    // If the player's balance is not found, set it to 100 and return 100
    this._playerBalances.set(playerID, 100);
    return 100;
  }

  /**
   * To set the balance of a player by ID.
   * If the player's balance is found, it updates the balance.
   * If the player's balance is not found, it throws an error.
   *

   * @param balance is the new balance to be set for the player.
   */
  public updatePlayerBalance(playerID: PlayerID, balance: number): void {
    this._playerBalances.set(playerID, balance);
  }

  // /////////////////////////////////////////////////////////////////////////////////////////
  /**
   * To check out a player's cart.
   * If the player's cart is empty, it throws an error.
   * If the player doesn't have enough money, it throws an error.
   * If the player's cart is not empty, it checks out the player's cart.
   *  - Reduces the balance of that player based on the checkout amount
   *  - Adds the items to the player's inventory.
   *  - Empties player cart
   *
   * @param playerId is the id of the player who is checking out
   */
  public checkOutPlayerCart(playerId: PlayerID): void {
    // Find play cart
    const playerCart = this.getPlayerCart(playerId);

    // Check for balance and cart value if the player can afford to check out
    const playerBalance = this.getPlayerBalance(playerId);
    const cartValue = playerCart.getItemListTotalValue();

    if (cartValue > playerBalance) {
      throw new Error(PLAYER_INSUFFICIENT_FUNDS_ERROR);
    }

    // Update player balance
    this.updatePlayerBalance(playerId, playerBalance - cartValue);
    // Add items to player inventory
    this.addToPlayerInventory(playerId, playerCart);
    // Clear player cart
    this.clearPlayerCart(playerId);
  }
}
