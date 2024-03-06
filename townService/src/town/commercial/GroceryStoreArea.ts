import Player from '../../lib/Player';
import {
  BoundingBox,
  GroceryStoreModel,
  InteractableCommand,
  InteractableCommandReturnType,
  PlayerID,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import GroceryStoreItemList from './database/GroceryStoreItemList';
import GroceryStoreItem from './database/GroceryStoreItem';
import { GroceryStoreItemName, groceryStoreItemPrices } from './types';
import InteractableArea from '../InteractableArea';
import PlayerDatabase from './database/PlayerDatabase';
import { INVALID_COMMAND_MESSAGE, ITEM_LIST_EMPTY_ERROR } from './errors';

/**
 * A GroceryStoreArea is an InteractableArea on the map that can host a grocery store.
 * There will be only one grocery store in the town.
 * The grocery store will have a list of items that can be bought by the players.
 *
 * _initializeGroceryStoreInventory() is a method that initializes the grocery store inventory.
 * _restockItems() is a method that restocks the grocery store with items.
 * _addItemToInventory() is a method that adds items to the grocery store inventory.
 * _removeItemFromInventory() is a method that removes items from the grocery store inventory.
 * isActive() is a method that checks if the grocery store is active.
 *
 * @param _playerDatabase is the player database that stores the player's inventory, purchase history, and trading history.
 * @param _groceryStoreInventory is the grocery store inventory that stores the list of items that can be bought by the players.
 */
export default class GroceryStoreArea extends InteractableArea {
  private _playerDatabase;

  private _groceryStoreInventory: GroceryStoreItemList = this._initializeGroceryStoreInventory();

  constructor(
    id: string,
    { x, y, width, height }: BoundingBox,
    townEmitter: TownEmitter,
    playerDatabase: PlayerDatabase,
    inventory?: GroceryStoreItemList,
  ) {
    // Calls the constructor of the parent class.
    super(id, { x, y, width, height }, townEmitter);

    // Sets the playerDatabase.
    this._playerDatabase = playerDatabase;

    // If the inventory is found, it sets the inventory.
    if (inventory) {
      this._groceryStoreInventory = inventory;
    }
  }

  /**
   * Initializes the grocery store inventory.
   * To loop through the groceryStoreItemPrices and add the items to the grocery store inventory.
   * The quantity of each item is set to 50.
   */
  private _initializeGroceryStoreInventory(): GroceryStoreItemList {
    const groceryStoreItemList = new GroceryStoreItemList();

    // Add items to the grocery store inventory
    Object.entries(groceryStoreItemPrices).forEach(([name, price]) => {
      const item = new GroceryStoreItem(name as GroceryStoreItemName, 50);
      groceryStoreItemList.addItem(item);
    });

    return groceryStoreItemList;
  }

  /** TODO
   * To restock the grocery store with items.
   */
  private _restockItems(itemList: GroceryStoreItemList[]) {
    throw new Error('Method not implemented.');
  }

  /**
   * To add items to the grocery store inventory.
   * If the itemList is empty, it throws an error.
   *
   * @param itemList is the list of items to be added to the grocery store inventory.
   */
  private _addItemsToInventory(itemList: GroceryStoreItemList) {
    // If the itemList is empty, it throws an error.
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    this._groceryStoreInventory.addItemList(itemList);
  }

  /**
   * To remove items to the grocery store.
   * If the itemList is empty, it throws an error.
   *
   * @param itemList is the list of items to be removed from the grocery store.
   */
  private _removeItemsFromInventory(itemList: GroceryStoreItemList) {
    // If the itemList is empty, it throws an error.
    if (itemList.isEmpty()) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }

    this._groceryStoreInventory.removeItemList(itemList);
  }

  /** TODO
   * To check out a player's cart.
   *
   * @param playerId is the id of the player who is checking out
   */
  private _checkOut(playerId: PlayerID): void {
    // Only if checked out successfully
    this._emitAreaChanged(); // Maybe?
  }

  /**
   * If the grocery store is active.
   */
  public get isActive(): boolean {
    return true;
  }

  /** TODO: maybe?
   * To transfer the grocery store into a model that can be sent to the client.
   */
  public toModel(): GroceryStoreModel {
    const { id } = this;
    return {
      type: 'GroceryStoreArea',
      id,
      occupants: this.occupantsByID,
      inventory: this._groceryStoreInventory,
    };
  }

  /** TODO
   * To handle the command from the player.
   *
   * Throw an error if the command is invalid.
   *
   * @param command is the command that the player wants to execute.
   * @param player is the player who wants to execute the command.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // Open menu command
    switch (command.type) {
      case 'OpenGroceryStore': // TODO
        throw new Error('Not implemented');
      case 'AddToCart':
        this._playerDatabase.addToPlayerCart(player.id, command.item);
        return undefined as InteractableCommandReturnType<CommandType>;
      case 'RemoveFromCart':
        this._playerDatabase.removeFromPlayerCart(player.id, command.item);
        return undefined as InteractableCommandReturnType<CommandType>;
      case 'CheckOut': // TODO
        throw new Error('Not implemented');
      default:
        throw new Error(INVALID_COMMAND_MESSAGE);
    }
  }
}
