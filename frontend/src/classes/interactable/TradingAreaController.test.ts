import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import TownController from '../TownController';
import TradingAreaController, { TradingAreaEvents } from './TradingAreaController';
import { PlayerLocation, TradingArea as TradingAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';

describe('[TradingAreaController]', () => {
  let tradingArea: TradingAreaController;
  let tradingModel: TradingAreaModel;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<TradingAreaEvents>();
  const interactableID = 'trading001';

  beforeEach(() => {
    tradingModel = {
      id: interactableID,
      occupants: [],
      type: 'TradingArea',
      tradingBoard: [],
      inventory: [],
    };
    tradingArea = new TradingAreaController(interactableID, townController);
    mockClear(townController);
    tradingArea.addListener('tradingAreaUpdated', mockListeners.tradingAreaUpdated);
  });

  describe('Initialization', () => {
    it('should initialize with the correct ID and empty trading board', () => {
      expect(tradingArea.id).toEqual(interactableID);
      expect(tradingArea.tradingBoard).toEqual([]);
      expect(tradingArea.inventory).toEqual([]);
    });
  });

  describe('isActive method', () => {
    it('should return true if there are occupants', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      tradingModel.occupants.push('player1');
      tradingArea.updateFrom(tradingModel, [
        new PlayerController('player1', 'player1', playerLocation),
      ]);
      expect(tradingArea.isActive()).toBeTruthy();
    });

    it('should return false if there are no occupants', () => {
      expect(tradingArea.isActive()).toBeFalsy();
    });
  });

  describe('handleOpenTradingBoard method', () => {
    it('should call sendInteractableCommand with the correct command type', async () => {
      await tradingArea.handleOpenTradingBoard();
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'OpenTradingBoard',
      });
    });
  });

  describe('handlePostTradingOffer method', () => {
    it('should call sendInteractableCommand to post a trading offer', async () => {
      const item = 'Apple';
      const quantity = 10;
      const itemDesire = 'Orange';
      const quantityDesire = 5;
      await tradingArea.handlePostTradingOffer(item, quantity, itemDesire, quantityDesire);
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'PostTradingOffer',
        item,
        quantity,
        itemDesire,
        quantityDesire,
      });
    });
  });

  describe('handleAcceptTradingOffer method', () => {
    it('should call sendInteractableCommand to accept a trading offer', async () => {
      const playerID = 'player2';
      const item = 'Apple';
      const quantity = 10;
      const itemDesire = 'Orange';
      const quantityDesire = 5;
      await tradingArea.handleAcceptTradingOffer(
        playerID,
        item,
        quantity,
        itemDesire,
        quantityDesire,
      );
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'AcceptTradingOffer',
        playerID,
        item,
        quantity,
        itemDesire,
        quantityDesire,
      });
    });
  });

  describe('Updating trading board', () => {
    it('should update the trading board and emit an event when trading board changes', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      const newTradingBoard = [
        { item: 'Apple', quantity: 10, itemDesire: 'Orange', quantityDesire: 5 },
      ];
      tradingArea.updateFrom({ ...tradingModel, tradingBoard: newTradingBoard }, [
        new PlayerController('player1', 'player1', playerLocation),
      ]);
      expect(tradingArea.tradingBoard).toEqual(newTradingBoard);
      expect(mockListeners.tradingAreaUpdated).toHaveBeenCalled();
    });
  });
});
