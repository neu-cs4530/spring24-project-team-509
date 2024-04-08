import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
import { TownEmitter } from '../types/CoveyTownSocket';
import TradingArea from './TradingArea';
import Player from '../lib/Player';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  }),
}));

describe('TradingArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: TradingArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    testArea = new TradingArea(
      { id, occupants: [], tradingBoard: [], inventory: [] },
      testAreaBox,
      townEmitter,
    );
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
  describe('handleCommand', () => {
    it('should OpenTradingBoard', async () => {
      const mockTradingData = { data: [], error: null };
      (
        createClient('mockUrl', 'mockKey').from('tradingBoard').select as jest.Mock
      ).mockResolvedValueOnce(mockTradingData);
      await testArea.handleCommand({ type: 'OpenTradingBoard' }, newPlayer);
      expect(createClient('mockUrl', 'mockKey').from).toBeCalledWith('tradingBoard');
    });
    // it('should PostTradingOffer', async () => {
    //   const mockTradingData = { data: [], error: null };
    //   (
    //     createClient('mockUrl', 'mockKey').from('tradingBoard').insert as jest.Mock
    //   ).mockResolvedValueOnce(mockTradingData);
    //   expect(async () => {
    //     await testArea.handleCommand(
    //       {
    //         type: 'PostTradingOffer',
    //         item: 'item',
    //         quantity: 5,
    //         itemDesire: 'item',
    //         quantityDesire: 5,
    //       },
    //       newPlayer,
    //     );
    //   }).toThrowError();
    // });
  });
});
