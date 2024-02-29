import Player from '../../lib/Player';
import {
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import GroceryStoreItemList from './database/GroceryStoreItemList';

/**
 * A GroceryStoreArea is an InteractableArea on the map that can host a grocery store.
 * There will be only one grocery store in the town.
 * The grocery store will have a list of items that can be bought by the players.
 */
export default class GroceryStoreArea extends InteractableArea {
  groceryStoreInventory = this._initializeGroceryStoreInventory();

  /**
   * Initializes the grocery store inventory.
   */
  private _initializeGroceryStoreInventory() {
    throw new Error('Method not implemented.');
  }

  /**
   * To add items to the grocery store.
   *
   * @param itemList is the list of items to be removed from the grocery store.
   */
  public removeItems(itemList: GroceryStoreItemList[]) {
    throw new Error('Method not implemented.');
  }

  /**
   * If the grocery store is active.
   */
  public get isActive(): boolean {
    return true;
  }

  /**
   * To transfer the grocery store into a model that can be sent to the client.
   */
  public toModel(): Interactable {
    throw new Error('Method not implemented.');
  }

  /**
   * To handle the command from the player.
   *
   * @param command is the command that the player wants to execute.
   * @param player is the player who wants to execute the command.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
