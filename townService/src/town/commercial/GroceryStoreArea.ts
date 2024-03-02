import Player from '../../lib/Player';
import {
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../../types/CoveyTownSocket';
import GroceryStoreItemList from './database/GroceryStoreItemList';
import GroceryStoreItem from './database/GroceryStoreItem';
import { GroceryStoreItemName, groceryStoreItemPrices } from './types';
import InteractableArea from '../InteractableArea';

/**
 * A GroceryStoreArea is an InteractableArea on the map that can host a grocery store.
 * There will be only one grocery store in the town.
 * The grocery store will have a list of items that can be bought by the players.
 */
export default class GroceryStoreArea extends InteractableArea {
  // private _playerDatabase; TODO

  private _groceryStoreInventory: GroceryStoreItemList = this._initializeGroceryStoreInventory();

  // TODO
  // constructor(inventory?: GroceryStoreItemList[]) {
  //   super('groceryStore');
  //   if (inventory) {
  //     this._restockItems(inventory);
  //   }
  // }

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

  /** TODO
   * To add items to the grocery store inventory.
   *
   * @param itemList is the list of items to be added to the grocery store inventory.
   */
  private _addItemsToInventory(itemList: GroceryStoreItemList[]) {
    throw new Error('Method not implemented.');
  }

  /** TODO
   * To remove items to the grocery store.
   *
   * @param itemList is the list of items to be removed from the grocery store.
   */
  private _removeItemsFromInventory(itemList: GroceryStoreItemList[]) {
    throw new Error('Method not implemented.');
  }

  /**
   * If the grocery store is active.
   */
  public get isActive(): boolean {
    return true;
  }

  /** TODO
   * To transfer the grocery store into a model that can be sent to the client.
   */
  public toModel(): Interactable {
    throw new Error('Method not implemented.');
  }

  /** TODO
   * To handle the command from the player.
   *
   * @param command is the command that the player wants to execute.
   * @param player is the player who wants to execute the command.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // Open menu command
    // Add to cart command
    // Remove from cart command
    // Checkout queue command
    throw new Error('Method not implemented.');
  }
}
