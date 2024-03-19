import { TradingArea as TradingAreaModel } from '../../types/CoveyTownSocket';
import InteractableAreaController, {
    BaseInteractableEventMap,
    VIEWING_AREA_TYPE,
} from './InteractableAreaController';

/**
 * The events that a ViewingAreaController can emit
 */
export type TradingAreaEvents = BaseInteractableEventMap & {
    tradingBoardChange: TradingAreaModel['tradingBoard'];
    tradingOfferChange: TradingAreaModel['tradingBoard'];
    tradingOfferAccepted: TradingAreaModel['tradingBoard'];
};   