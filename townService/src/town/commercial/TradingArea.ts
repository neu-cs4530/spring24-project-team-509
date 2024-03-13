import Player from '../../lib/Player';
import {
  BoundingBox,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  TradingArea as TradingAreaModel,
} from '../../types/CoveyTownSocket';
import CommercialArea from './CommercialArea';
import TradingOffer from './database/TradingOffer';

/**
 * A TradingArea is an InteractableArea on the map that can host a trading area.
 * There will be only one trading area in the town.
 * The trading area will have a list of trading offers that can be traded by the players.
 *
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

  /** TODO
   * Post a new trading offer into the board.
   *
   * @param player
   * @param tradingOffer
   */
  public postTradingOffer(tradingOffer: TradingOffer): void {
    if (!tradingOffer) {
      throw new Error('Trading offer is not provided');
    }
    // Add the trading offer to the trading board.
    this._tradingBoard.push(tradingOffer);
  }

  /** TODO
   * Accept a trading offer from the board.
   * Remove the trading offer from the board after accepted.
   * Exchange players' items.
   *
   * @param tradingOffer is the trading offer to be accepted.
   */
  public acceptTradingOffer(tradingOffer: TradingOffer): void {
    if (!tradingOffer) {
      throw new Error('Trading offer is not provided');
    }
    // Remove the trading offer from the trading board.
    this._tradingBoard = this._tradingBoard.filter(offer => offer !== tradingOffer);
    // Add the itemsYouHave to the player2's inventory.
    if (!tradingOffer.player2) {
      throw new Error('Player2 is not set');
    }
    this._playerDatabase.addToPlayerInventory(tradingOffer.player2, tradingOffer.itemsYouHave);
    // Add the itemsYouWant to the player1's inventory.
    this._playerDatabase.addToPlayerInventory(tradingOffer.player1, tradingOffer.itemsYouWant);
  }

  /**
   * Get the current trading board.
   * @returns The array of trading offers on the board.
   */
  public get tradingBoard(): TradingOffer[] {
    return this._tradingBoard;
  }

  /** TODO
   * To model the trading area.
   */
  public toModel(): Interactable {
    // Implement the logic to convert TradingArea to its corresponding model representation
    // Return the model object

    throw new Error();
  }

  /** TODO
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
    throw new Error();
  }
}
