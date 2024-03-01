import Player from '../../lib/Player';
import {
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../../types/CoveyTownSocket';
import GroceryStoreItemList from './database/GroceryStoreItemList';
import GroceryStoreItem from './database/GroceryStoreItem';
import CommercialArea from './CommercialArea';

/**
 * A GroceryStoreArea is an InteractableArea on the map that can host a grocery store.
 * There will be only one grocery store in the town.
 * The grocery store will have a list of items that can be bought by the players.
 */
export default class GroceryStoreArea extends CommercialArea {
  private _groceryStoreInventory = this._initializeGroceryStoreInventory();

  private _playerPurchaseHistory = new Map<string, Array<GroceryStoreItemList>>();

  // TODO: krishna
  private _cart = new Map<string, Array<GroceryStoreItemList>>();

  // TODO
  // constructor(inventory?: GroceryStoreItemList[]) {
  //   super('groceryStore');
  //   if (inventory) {
  //     this._restockItems(inventory);
  //   }
  // }

  /**
   * TODO: krishna
   * cart functions
   */
  private _addToCart(item: GroceryStoreItem) {
    throw new Error('Method not implemented.');
  }

  /* TODO
   */
  private _removeFromCart(item: GroceryStoreItem) {
    throw new Error('Method not implemented.');
  }

  /**
   * Initializes the grocery store inventory.
   * TODO
   */
  private _initializeGroceryStoreInventory() {
    throw new Error('Method not implemented.');
  }

  /**
   * TODO
   * To restock the grocery store with items.
   */
  private _restockItems(itemList: GroceryStoreItemList[]) {
    throw new Error('Method not implemented.');
  }

  /**
   * To remove items to the grocery store.
   *
   * @param itemList is the list of items to be removed from the grocery store.
   */
  private _removeItemsFromInventory(itemList: GroceryStoreItemList[]) {
    throw new Error('Method not implemented.');
  }

  /**
   * To add items to the player's purchase history.
   * If the player's purchase history is found, it adds the items to the player's purchase history.
   * If the player's purchase history is not found, it creates a new purchase history for the player and adds the items to the player's purchase history.
   *
   * @param playerID is the id of the player.
   * @param itemList is the list of items to be added to the player's purchase history.
   */
  protected _addToPlayerPurchaseHistory(playerID: string, itemList: GroceryStoreItemList): void {
    // If the player's purchase history is found, it adds the items to the player's purchase history.
    const playerPurchaseHistory = this._playerPurchaseHistory.get(playerID);

    // If the player's purchase history is found
    if (playerPurchaseHistory) {
      playerPurchaseHistory.push(itemList);
    } else {
      this._playerPurchaseHistory.set(playerID, [itemList]);
    }
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
    // Open menu command
    // Add to cart command
    // Remove from cart command
    // Checkout queue command
    throw new Error('Method not implemented.');
  }
}
