import InteractableAreaController, {
  BaseInteractableEventMap,
  TRADING_AREA_TYPE,
} from './InteractableAreaController';
import { TradingArea as TradingAreaModel } from '../../types/CoveyTownSocket';
import { Tr } from '@chakra-ui/react';

export type TradingAreaEvents = BaseInteractableEventMap & {
  tradingAreaUpdated: () => void;
};

export default class TradingAreaController extends InteractableAreaController<
  TradingAreaEvents,
  TradingAreaModel
> {
  toInteractableAreaModel(): TradingAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'TradingArea',
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

  protected _updateFrom(updatedModel: TradingAreaModel): void {
    // No updates to make
    this.emit('tradingAreaUpdated');
  }
}
