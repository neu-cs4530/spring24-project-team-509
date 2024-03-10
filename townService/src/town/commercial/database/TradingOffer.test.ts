import TradingOffer from './TradingOffer';
import GroceryStoreItemList from './GroceryStoreItemList';
import { TRADE_ALREADY_COMPLETED_ERROR, PLAYER_2_NOT_SET_ERROR } from '../errors';

describe('TradingOffer', () => {
  let tradingOffer: TradingOffer;
  let itemsYouHave: GroceryStoreItemList;
  let itemsYouWant: GroceryStoreItemList;
  const playerInitiate = 'player1';
  const playerAccept = 'player2';

  beforeEach(() => {
    itemsYouHave = new GroceryStoreItemList();
    itemsYouWant = new GroceryStoreItemList();
    tradingOffer = new TradingOffer(itemsYouHave, itemsYouWant, playerInitiate);
  });

  it('should initialize with correct values', () => {
    expect(tradingOffer.itemsYouHave).toBe(itemsYouHave);
    expect(tradingOffer.itemsYouWant).toBe(itemsYouWant);
    expect(tradingOffer.player1).toBe(playerInitiate);
    expect(tradingOffer.tradeCompleted).toBe(false);
  });

  it('should complete the trade', () => {
    tradingOffer.acceptTrade(playerAccept);
    expect(tradingOffer.tradeCompleted).toBe(true);
  });

  it('should throw an error if trade is already completed', () => {
    tradingOffer.acceptTrade(playerAccept);
    expect(() => tradingOffer.acceptTrade(playerAccept)).toThrowError(
      TRADE_ALREADY_COMPLETED_ERROR,
    );
  });
});
