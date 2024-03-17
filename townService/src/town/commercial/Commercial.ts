import { Interactable, PlayerID } from '../../types/CoveyTownSocket';

/**
 * This class is the base class for all commercial activities.
 * As a model, Commercial should handle the business logic and data management related to commercial activities.
 * It may interact with other models to handle player interactions and manage the state of the commercial zones.
 * add in a parameter for the state if necessary later <StateType extends CommercialState>
 */
export interface Commercial extends Interactable {
  /**
   * This method is called when a player wants to buy an item from the commercial area.
   * @param playerID the id of the player who wants to buy the item
   * @param itemID the id of the item that the player wants to buy
   */
  buyItem(playerID: PlayerID, itemID: string): void;

  /**
   * This method is called when a player wants to sell an item to the commercial area.
   * @param playerID the id of the player who wants to sell the item
   * @param itemID the id of the item that the player wants to sell
   */
  sellItem(playerID: PlayerID, itemID: string): void;

  // /**
  //  * This method is called when a player wants to post an item for sale in the commercial area.
  //  * @param playerID the id of the player who wants to post the item
  //  * @param itemID the id of the item that the player wants to post
  //  * @param price the price that the player wants to sell the item for
  //  */
  // postItemForSale(playerID: PlayerID, itemID: string, price: number): void;

  /**
   * This method is called when a player wants to remove an item from the commercial area.
   * @param playerID the id of the player who wants to remove the item
   * @param itemID the id of the item that the player wants to remove
   */
  removeItem(playerID: PlayerID, itemID: string): void;

  // /**
  //  * This method is called when a player wants to view the items that are for sale in the commercial area.
  //  * @param playerID the id of the player who wants to view the items
  //  */
  // viewItemsForSale(playerID: PlayerID): void;

  /**
   * This method is called when a player wants to view the items in their inventory or cart or trading bulletin.
   * @param playerID the id of the player who wants to view their items
   */
  viewMyItems(playerID: PlayerID): void;
}
