import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TradingOffer from './database/TradingOffer';
import { TownEmitter } from '../../types/CoveyTownSocket';
import TradingArea from './TradingArea';

describe('TradingArea', () => {
  let tradingArea: TradingArea;
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  const id = nanoid();
  const townEmitter = mock<TownEmitter>();
  const tradingBoard: TradingOffer[] = [];

  beforeEach(() => {
    mockClear(townEmitter);
    tradingArea = new TradingArea({ tradingBoard, id, occupants: [] }, testAreaBox, townEmitter);
  });

  it('should model the trading area', () => {
    const model = tradingArea.toModel();
    expect(model).toHaveProperty('id', '1');
    expect(model).toHaveProperty('type', 'TradingArea');
    expect(model).toHaveProperty('boundingBox');
    expect(model).toHaveProperty('tradingBoard');
  });
});
