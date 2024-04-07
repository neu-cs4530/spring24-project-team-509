import InteractableAreaController, {
  BaseInteractableEventMap,
  TRADING_AREA_TYPE,
} from './InteractableAreaController';
import { TradingArea as TradingAreaModel, GroceryItem } from '../../types/CoveyTownSocket';
import TownController from '../TownController';

export type TradingAreaEvents = BaseInteractableEventMap & {
  tradingAreaUpdated: () => void;
};

export default class TradingAreaController extends InteractableAreaController<
  TradingAreaEvents,
  TradingAreaModel
> {
  protected _tradingBoard: any[] = [];

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

  get tradingBoard(): any[] {
    return this._tradingBoard;
  }

  protected _updateFrom(updatedModel: TradingAreaModel): void {
    this._tradingBoard = updatedModel.tradingBoard;
    this._inventory = updatedModel.inventory;
    this._playerID = updatedModel.name;
    console.log('tradingControl updates', this._tradingBoard, this._inventory);
    this.emit('tradingAreaUpdated');
  }

  public async handleOpenTradingBoard(): Promise<void> {
    console.log('tradingControl opens');
    await this._townController.sendInteractableCommand(this.id, {
      type: 'OpenTradingBoard',
    });
  }

  public async handleDeleteOffer(playerID: string): Promise<void> {
    console.log('tradingControl closes');
    await this._townController.sendInteractableCommand(this.id, {
      type: 'DeleteOffer',
      playerID,
    });
  }

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
