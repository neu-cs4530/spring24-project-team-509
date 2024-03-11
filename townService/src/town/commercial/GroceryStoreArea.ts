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
import PlayerDatabase from './database/PlayerDatabase';
import {
  INSUFFICIENT_FUNDS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
  ITEM_LIST_EMPTY_ERROR,
} from './errors';
import CommercialArea from './CommercialArea';

/**
 * A GroceryStoreArea is an InteractableArea on the map that can host a grocery store.
 * There will be only one grocery store in the town.
 * The grocery store will have a list of items that can be bought by the players.
 *
 * _initializeGroceryStoreInventory() is a method that initializes the grocery store inventory.
 * _restockItems() is a method that restocks the grocery store with items.
 * _addItemToInventory() is a method that adds items to the grocery store inventory.
 * _removeItemFromInventory() is a method that removes items from the grocery store inventory.
 * toModel() is a method that transfers the grocery store into a model that can be sent to the client.
 * handleCommand() is a method that handles the command from the player.
 *
 * @param _playerDatabase is the player database that stores the player's inventory, purchase history, and trading history.
 * @param _groceryStoreInventory is the grocery store inventory that stores the list of items that can be bought by the players.
 */
export default class GroceryStoreArea extends CommercialArea {
  private _groceryStoreInventory: GroceryStoreItemList = this._initializeGroceryStoreInventory();

  constructor(
    id: string,
    { x, y, width, height }: BoundingBox,
    townEmitter: TownEmitter,
    playerDatabase: PlayerDatabase,
    inventory?: GroceryStoreItemList,
  ) {
    // Calls the constructor of the parent class.
    super(id, { x, y, width, height }, townEmitter, playerDatabase);

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
  protected _initializeGroceryStoreInventory(): GroceryStoreItemList {
    const groceryStoreItemList = new GroceryStoreItemList();

    // Add items to the grocery store inventory
    Object.entries(groceryStoreItemPrices).forEach(([name]) => {
      const item = new GroceryStoreItem(name as GroceryStoreItemName, 50);
      groceryStoreItemList.addItem(item);
    });

    return groceryStoreItemList;
  }

  /**
   * To restock the grocery store with items.
   * Restock to the +10 items when there is 0 in the grocery inventory for a certain item.
   * @param itemList is the list of items to be restocked.
   * @throws {Error} if the itemList is empty.
   */
  // note to self: do we want to have a set initial quantity for all items, do we restock to that same quantity
  private _restockItems() {
    if (this._groceryStoreInventory.itemList.length === 0) {
      throw new Error(ITEM_LIST_EMPTY_ERROR);
    }
    for (const item of this._groceryStoreInventory.itemList) {
      if (item.quantity === 0) {
        item.setQuantity(10);
      }
    }
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
   * @throws error if the player's cart is empty, or if the player doesn't have enough money.
   * If the player's cart is not empty, it checks out the player's cart.
   *  - Reduces the balance of that player based on the checkout amount
   *  - Adds the items to the player's inventory.
   *  - Empties player cart
   * @param playerId is the id of the player who is checking out
   */
  private _checkOut(playerId: PlayerID): void {
    // Get the player's cart
    const cart = this._playerDatabase.getPlayerCart(playerId);
    let checkoutAmount = 0;
    Object.entries(cart).forEach(([item, quantity]) => {
      // Add type annotation for 'item'
      checkoutAmount +=
        groceryStoreItemPrices[item as keyof typeof groceryStoreItemPrices] * quantity;
    });
    let balance = this._playerDatabase.getPlayerBalance(playerId); // TODO Manh and Jiaying: player balance also needs to be tracked    // Check if the player has enough money
    if (balance < checkoutAmount) {
      throw new Error(INSUFFICIENT_FUNDS_MESSAGE);
    } else {
      // Reduce the balance of the player based on the checkout amount and add the items to the player's inventory
      balance = -checkoutAmount;
      this._playerDatabase.addToPlayerInventory(playerId, cart);
      this._playerDatabase.clearPlayerCart(playerId);
      this._emitAreaChanged(); // Maybe?
    }
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
      case 'OpenGroceryStore':
        if (!this._groceryStoreInventory) {
          this._initializeGroceryStoreInventory();
        }
        this.add(player);
        return undefined as InteractableCommandReturnType<CommandType>;
      case 'AddToCart':
        this._playerDatabase.addToPlayerCart(player.id, command.item);
        return undefined as InteractableCommandReturnType<CommandType>;
      case 'RemoveFromCart':
        this._playerDatabase.removeFromPlayerCart(player.id, command.item);
        return undefined as InteractableCommandReturnType<CommandType>;
      case 'CheckOut':
        this._checkOut(player.id);
        return undefined as InteractableCommandReturnType<CommandType>;
      default:
        throw new Error(INVALID_COMMAND_MESSAGE);
    }
  }
}
