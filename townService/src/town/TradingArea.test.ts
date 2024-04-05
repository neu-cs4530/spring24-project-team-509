import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { TownEmitter } from '../types/CoveyTownSocket';
import TradingArea from './TradingArea';
import Player from '../lib/Player';

describe('TradingArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: TradingArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    testArea = new TradingArea({ id, occupants: [], tradingBoard: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('constructor', () => {
    it('should create a TradingArea', () => {
      expect(testArea).toBeInstanceOf(TradingArea);
    });
  });
  describe('toModel', () => {
    it('should return a TradingAreaModel', () => {
      const model = testArea.toModel();
      expect(model.id).toBe(id);
      expect(model.occupants).toEqual([newPlayer.id]);
      expect(model.type).toBe('TradingArea');
      expect(model.tradingBoard).toEqual([]);
    });
  });
  describe('fromMapObject', () => {
    it('should throw an error because height and weight are missing', () => {
      const mapObject = { id: 1, name: nanoid(), visible: true, x: 0, y: 0 };
      expect(() => TradingArea.fromMapObject(mapObject, townEmitter)).toThrowError();
    });
    it('should create a TradingArea', () => {
      const mapObject = {
        id: 1,
        name: nanoid(),
        visible: true,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      const tradingArea = TradingArea.fromMapObject(mapObject, townEmitter);
      expect(tradingArea).toBeInstanceOf(TradingArea);
    });
  });
});
