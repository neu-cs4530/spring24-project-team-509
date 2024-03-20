import Player from '../../lib/Player';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  PlayerID,
  TownEmitter,
  TradingArea as TradingAreaModel,
} from '../../types/CoveyTownSocket';
import CommercialArea from './CommercialArea';
import TradingOffer from './database/TradingOffer';
import {
  INVALID_COMMAND_MESSAGE,
  INVALID_TRADE_OFFER,
  PLAYER_CANNOT_ACCEPT_OWN_OFFER,
  PLAYER_INSUFFICIENT_INVENTORY_ERROR,
} from './errors';

/**
 * A TradingArea is an InteractableArea on the map that can host a trading area.
 * There will be only one trading area in the town.
 * The trading area will have a list of trading offers that can be traded by the players.
 *
 * postTradingOffer() is a method that posts a trading offer into the trading board.
 * acceptTradingOffer() is a method that accepts a trading offer from the trading board.
 * toModel() is a method that transfers the trading area into a model that can be sent to the client.
 * handleCommand() is a method that handles the command from the player.
 */
export default class TradingArea extends CommercialArea {
  private _tradingBoard: TradingOffer[] = [];

  constructor(
    { id, tradingBoard }: Omit<TradingAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    // Calls the constructor of the parent class.
    super(id, coordinates, townEmitter);

    // Sets the tradingBoard.
    if (tradingBoard) {
      this._tradingBoard = tradingBoard;
    }
  }

  /**
   * Get the current trading board.
   * @returns The array of trading offers on the board.
   */
  public get tradingBoard(): TradingOffer[] {
    return this._tradingBoard;
  }

  /**
   * Post a new trading offer into the board.
   *
   * @param player
   * @param tradingOffer
   */
  public postTradingOffer(tradingOffer: TradingOffer): void {
    if (!tradingOffer) {
      throw new Error(INVALID_TRADE_OFFER);
    }
    // Add the trading offer to the trading board.
    this._tradingBoard.push(tradingOffer);
  }

  /**
   * Accept a trading offer from the board.
   * Remove the trading offer from the board after accepted.
   * Exchange players' items.
   *
   * @param tradingOffer is the trading offer to be accepted.
   */
  public acceptTradingOffer(tradingOffer: TradingOffer, playerId: PlayerID): void {
    if (!tradingOffer) {
      throw new Error(INVALID_TRADE_OFFER);
    }
    if (tradingOffer.player1 === playerId) {
      throw new Error(PLAYER_CANNOT_ACCEPT_OWN_OFFER);
    }

    // Check if the player 1 still has the items.
    const player1Inventory = this._playerDatabase.getPlayerInventory(tradingOffer.player1);
    if (!player1Inventory.hasItems(tradingOffer.itemsYouWant)) {
      throw new Error(PLAYER_INSUFFICIENT_INVENTORY_ERROR);
    }
    // Check if the player 2 still has the items.
    const player2Inventory = this._playerDatabase.getPlayerInventory(playerId);
    if (!player2Inventory.hasItems(tradingOffer.itemsYouHave)) {
      throw new Error(PLAYER_INSUFFICIENT_INVENTORY_ERROR);
    }

    // Set the player2 to the player that accepted the trade.
    tradingOffer.acceptTrade(playerId);

    // Remove the trading offer from the trading board.
    this._tradingBoard = this._tradingBoard.filter(offer => offer !== tradingOffer);

    // Remove the items from the players' inventory.
    this._playerDatabase.removeFromPlayerInventory(tradingOffer.player1, tradingOffer.itemsYouWant);
    this._playerDatabase.removeFromPlayerInventory(playerId, tradingOffer.itemsYouHave);

    // Add the items to the players' inventory.
    this._playerDatabase.addToPlayerInventory(playerId, tradingOffer.itemsYouHave);
    this._playerDatabase.addToPlayerInventory(tradingOffer.player1, tradingOffer.itemsYouWant);
  }

  /** 
   * To model the trading area.
   */
  public toModel(): TradingAreaModel {
    // Implement the logic to convert TradingArea to its corresponding model representation
    // Return the model object

    return {
      id: this.id,
      occupants: this.occupantsByID,
      tradingBoard: this._tradingBoard,
      type: 'TradingArea',
    };
  }

  /** TODO: maybe?
   *
   * @param command
   * @param player
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // Implement the logic to handle different commands received by the TradingArea
    // Use the 'command' parameter to determine the type of command and perform the necessary actions
    // Use the 'player' parameter to access the player information and update the TradingArea accordingly
    // Return the result of the command execution
    // Example:
    switch (command.type) {
      case 'PostTradingOffer':
        this.postTradingOffer(command.tradingOffer);
        return undefined as InteractableCommandReturnType<CommandType>;
      case 'AcceptTradingOffer':
        this.acceptTradingOffer(command.tradingOffer, player.id);
        return undefined as InteractableCommandReturnType<CommandType>;
      default:
        throw new Error(INVALID_COMMAND_MESSAGE);
    }
  }
}
