import { PlayerID } from '../../../types/CoveyTownSocket';
import { PLAYER_2_NOT_SET_ERROR, TRADE_ALREADY_COMPLETED_ERROR } from '../errors';
import GroceryStoreItemList from './GroceryStoreItemList';

/** TODO
 * TradingOffer is a trading offer that a player initiated.
 * TradingOffer contains a list of items the player is giving out.
 * TradingOffer contains a list of items the player wants.
 *
 * completedTrade() is a method that sets the tradeCompleted to true.
 * acceptTrade() is a method that sets the player2 to the player that accepted the trade.
 */
export default class TradingOffer {
  private _itemsYouHave: GroceryStoreItemList;

  private _itemsYouWant: GroceryStoreItemList;

  private _playerInitiate: PlayerID;

  private _playerAccept: PlayerID | null = null;

  private _tradeCompleted = false;

  constructor(
    itemsYouHave: GroceryStoreItemList,
    itemsYouWant: GroceryStoreItemList,
    playerInitiate: PlayerID,
  ) {
    this._itemsYouHave = itemsYouHave;
    this._itemsYouWant = itemsYouWant;
    this._playerInitiate = playerInitiate;
  }

  public get itemsYouHave(): GroceryStoreItemList {
    return this._itemsYouHave;
  }

  public get itemsYouWant(): GroceryStoreItemList {
    return this._itemsYouWant;
  }

  public get player1(): PlayerID {
    return this._playerInitiate;
  }

  public get tradeCompleted(): boolean {
    return this._tradeCompleted;
  }

  /**
   * Complete the trade by setting the tradeCompleted to true.
   * If the trade is already completed, throw an error.
   * If player2 is not set, throw an error.
   */
  private _completeTrade() {
    // If the trade is already completed, throw an error.
    if (this._tradeCompleted) {
      throw new Error(TRADE_ALREADY_COMPLETED_ERROR);
    }

    // If player2 is not set, throw an error.
    if (this._playerAccept === null) {
      throw new Error(PLAYER_2_NOT_SET_ERROR);
    }

    this._tradeCompleted = true;
  }

  /**
   * To accept the trade, the player2 must be the player that accepted the trade.
   *
   * @param player2 is the player that accepted the trade.
   */
  public acceptTrade(playerAccept: PlayerID) {
    this._playerAccept = playerAccept;
    this._completeTrade();
  }
}
