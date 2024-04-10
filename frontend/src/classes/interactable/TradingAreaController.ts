import InteractableAreaController, {
  BaseInteractableEventMap,
  TRADING_AREA_TYPE,
} from './InteractableAreaController';
import {
  TradingArea as TradingAreaModel,
  GroceryItem,
  TradingOffer,
} from '../../types/CoveyTownSocket';
import TownController from '../TownController';

export type TradingAreaEvents = BaseInteractableEventMap & {
  tradingAreaUpdated: () => void;
};

/**
 * TradingAreaController is a class that extends InteractableAreaController.
 * It is responsible for handling the trading area.
 * It contains methods to open the trading board, post a trading offer, delete a trading offer, and accept a trading offer.
 */
export default class TradingAreaController extends InteractableAreaController<
  TradingAreaEvents,
  TradingAreaModel
> {
  protected _tradingBoard: TradingOffer[] = [];

  protected _error: string | undefined = undefined;

  protected _townController: TownController;

  protected _inventory: GroceryItem[] = [];

  protected _playerID: string | undefined = undefined;

  constructor(id: string, townController: TownController) {
    super(id);
    this._townController = townController;
    this._tradingBoard = [];
  }

  toInteractableAreaModel(): TradingAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'TradingArea',
      tradingBoard: this._tradingBoard,
      inventory: this._inventory,
      name: this.id,
    };
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  get inventory(): GroceryItem[] {
    return this._inventory;
  }

  get type(): string {
    return TRADING_AREA_TYPE;
  }

  get friendlyName(): string {
    return this.id;
  }

  get error(): string | undefined {
    return this._error;
  }

  get playerID(): string | undefined {
    return this._playerID;
  }

  get tradingBoard(): TradingOffer[] {
    return this._tradingBoard;
  }

  /**
   * To update the trading area with the updated model.
   *
   * @param updatedModel is the updated model of the trading area
   */
  protected _updateFrom(updatedModel: TradingAreaModel): void {
    this._tradingBoard = updatedModel.tradingBoard;
    this._inventory = updatedModel.inventory;
    this._playerID = updatedModel.name;
    this.emit('tradingAreaUpdated');
  }

  /**
   * To open the trading board.
   */
  public async handleOpenTradingBoard(): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'OpenTradingBoard',
    });
  }

  /**
   * To delete the trading board offer.
   *
   * @param playerID is the player ID of the player who posted the offer
   */
  public async handleDeleteOffer(playerID: string): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'DeleteOffer',
      playerID,
    });
  }

  /**
   * To post a trading offer.
   *
   * @param item is the item that the player wants to trade
   * @param quantity is the quantity of the item that the player wants to trade
   * @param itemDesire is the item that the player wants to receive
   * @param quantityDesire is the quantity of the item that the player wants to receive
   */
  public async handlePostTradingOffer(
    item: string,
    quantity: number,
    itemDesire: string,
    quantityDesire: number,
  ): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'PostTradingOffer',
      item,
      quantity,
      itemDesire,
      quantityDesire,
    });
  }

  /**
   * To accept a trading offer.
   *
   * @param playerID is the player ID of the player who posted the offer
   * @param item is the item that the player wants to trade
   * @param quantity is the quantity of the item that the player wants to trade
   * @param itemDesire is the item that the player wants to receive
   * @param quantityDesire is the quantity of the item that the player wants to receive
   */
  public async handleAcceptTradingOffer(
    playerID: string,
    item: string,
    quantity: number,
    itemDesire: string,
    quantityDesire: number,
  ): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'AcceptTradingOffer',
      playerID,
      item,
      quantity,
      itemDesire,
      quantityDesire,
    });
  }
}
