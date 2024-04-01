import InteractableAreaController, {
  BaseInteractableEventMap,
  TRADING_AREA_TYPE,
} from './InteractableAreaController';
import { TradingArea as TradingAreaModel } from '../../types/CoveyTownSocket';
import { Tr } from '@chakra-ui/react';
import TownController from '../TownController';

export type TradingAreaEvents = BaseInteractableEventMap & {
  tradingAreaUpdated: () => void;
};

export default class TradingAreaController extends InteractableAreaController<
  TradingAreaEvents,
  TradingAreaModel
> {

  protected _tradingBoard: any[] = [];
  protected _townController: TownController;

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
    };
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  get type(): string {
    return TRADING_AREA_TYPE;
  }

  get friendlyName(): string {
    return this.id;
  }

  get tradingBoard(): any[] { 
    return this._tradingBoard;
  }

  protected _updateFrom(updatedModel: TradingAreaModel): void {
    const oldBoard = this._tradingBoard;
    if (oldBoard !== updatedModel.tradingBoard) {
      this._tradingBoard = updatedModel.tradingBoard;
      console.log('tradingControl updates', this._tradingBoard);
      this.emit('tradingAreaUpdated');
    }
  }

  public async handleOpenTradingBoard(): Promise<void> {
    console.log('tradingControl opens')
    await this._townController.sendInteractableCommand(this.id, {
      type: 'OpenTradingBoard',
    });
  }

  public async handlePostTradingOffer(item: string, quantity: number): Promise<void> {
    console.log('tradingControl post')
    await this._townController.sendInteractableCommand(this.id, {
      type: 'PostTradingOffer',
      item: item,
      quantity: quantity, 
    });
  }
}
