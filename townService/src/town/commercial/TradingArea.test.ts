import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TradingOffer from './database/TradingOffer';
import { TownEmitter } from '../../types/CoveyTownSocket';
import TradingArea from './TradingArea';
import GroceryStoreItemList from './database/GroceryStoreItemList';
import Player from '../../lib/Player';
import { getLastEmittedEvent } from '../../TestUtils';

describe('TradingArea', () => {
  let tradingArea: TradingArea;
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  const id = nanoid();
  const townEmitter = mock<TownEmitter>();
  const tradingBoard: TradingOffer[] = [];
  let tradingOffer: TradingOffer;
  let itemsYouHave: GroceryStoreItemList;
  let itemsYouWant: GroceryStoreItemList;
  const playerInitiate = 'player1';
  const playerAccept = 'player2';
  let newPlayer: Player;
  let interactableUpdateSpy: jest.SpyInstance;

  beforeEach(() => {
    mockClear(townEmitter);
    tradingArea = new TradingArea({ tradingBoard, id, occupants: [] }, testAreaBox, townEmitter);
    itemsYouHave = new GroceryStoreItemList();
    itemsYouWant = new GroceryStoreItemList();
    tradingOffer = new TradingOffer(itemsYouHave, itemsYouWant, playerInitiate);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    tradingArea.add(newPlayer);
    //interactableUpdateSpy = jest.spyOn(tradingArea, '_emitAreaChanged');
  });
  describe('TradingArea', () => {
    it('should model the trading area', () => {
      const model = tradingArea.toModel();
      expect(model).toEqual({
        id,
        tradingBoard,
        occupants: [newPlayer.id],
        type: 'TradingArea',
      });
    });
    describe('add', () => {
      it('should add a player to the trading area', () => {
        expect(tradingArea.occupantsByID).toEqual([newPlayer.id]);
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id,
          tradingBoard,
          occupants: [newPlayer.id],
          type: 'TradingArea',
        });
      });
      it("Sets the player's conversationLabel and emits an update for their location", () => {
        expect(newPlayer.location.interactableID).toEqual(id);

        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.location.interactableID).toEqual(id);
      });
    });
    describe('remove', () => {
      it('should remove a player from the trading area', () => {
        const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
        tradingArea.add(extraPlayer);
        tradingArea.remove(newPlayer);

        expect(tradingArea.occupantsByID).toEqual([extraPlayer.id]);
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id,
          tradingBoard,
          occupants: [extraPlayer.id],
          type: 'TradingArea',
        });
      });
      it("Clears the player's label and emits an update for their location", () => {
        tradingArea.remove(newPlayer);
        expect(newPlayer.location.interactableID).toBeUndefined();
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.location.interactableID).toBeUndefined();
      });
    });
  });

  describe('TradingBoard', () => {
    it('should post a trading offer to the trading board', () => {
      const tradingOffer = new TradingOffer(itemsYouHave, itemsYouWant, playerInitiate);
      tradingArea.postTradingOffer(tradingOffer);
      expect(tradingArea.tradingBoard).toContain(tradingOffer);
    });
    it('should accept a trading offer from the trading board', () => {
      const tradingOffer = new TradingOffer(itemsYouHave, itemsYouWant, playerInitiate);
      tradingArea.postTradingOffer(tradingOffer);
      tradingOffer.acceptTrade(playerAccept);
      tradingArea.acceptTradingOffer(tradingOffer);

      expect(tradingArea.tradingBoard).not.toContain(tradingOffer);
    });
  });

  
});
