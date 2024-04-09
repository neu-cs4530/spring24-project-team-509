import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
import { TownEmitter } from '../types/CoveyTownSocket';
import GroceryStoreArea from './GroceryStoreArea';
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

describe('GroceryStoreArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: GroceryStoreArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    testArea = new GroceryStoreArea(
      { id, occupants: [], totalPrice: 0, storeInventory: [], cart: [], balance: 0, history: [] },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('constructor', () => {
    it('should create a GroceryStoreArea', () => {
      expect(testArea).toBeInstanceOf(GroceryStoreArea);
    });
  });
  describe('toModel', () => {
    it('should return a GroceryStoreAreaModel', () => {
      const model = testArea.toModel();
      expect(model.id).toBe(id);
      expect(model.occupants).toEqual([newPlayer.id]);
      expect(model.type).toBe('GroceryStoreArea');
      expect(model.totalPrice).toBe(0);
      expect(model.storeInventory).toEqual([]);
      expect(model.cart).toEqual([]);
    });
  });
  describe('fromMapObject', () => {
    it('should throw an error because height and weight are missing', () => {
      const mapObject = { id: 1, name: nanoid(), visible: true, x: 0, y: 0 };
      expect(() => GroceryStoreArea.fromMapObject(mapObject, townEmitter)).toThrowError();
    });
    it('should create a GroceryStoreArea', () => {
      const mapObject = {
        id: 1,
        name: nanoid(),
        visible: true,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      const groceryStoreArea = GroceryStoreArea.fromMapObject(mapObject, townEmitter);
      expect(groceryStoreArea).toBeInstanceOf(GroceryStoreArea);
    });
  });
  describe('handleCommand', () => {
    it('open grocery store', async () => {
      const mockCartData = { data: { name: 'bacon', quantity: '5', price: '5' }, error: null };
      const mockInventoryData = { data: { name: 'bacon', quantity: '5', price: '5' }, error: null };

      (
        createClient('mockUrl', 'mockKey').from('storeCart').select as jest.Mock
      ).mockResolvedValueOnce(mockCartData);
      (
        createClient('mockUrl', 'mockKey').from('storeInventory').select as jest.Mock
      ).mockResolvedValueOnce(mockInventoryData);

      await testArea.handleCommand({ type: 'OpenGroceryStore' }, newPlayer);

      expect(createClient('mockUrl', 'mockKey').from).toHaveBeenCalledWith('storeCart');
      expect(createClient('mockUrl', 'mockKey').from).toHaveBeenCalledWith('storeInventory');
    });
    it('should add item to cart', async () => {
      const mockCartData = { data: { name: 'bacon', quantity: '5', price: '5' }, error: null };
      (
        createClient('mockUrl', 'mockKey').from('storeCart').select as jest.Mock
      ).mockResolvedValueOnce(mockCartData);

      await testArea.handleCommand({ type: 'AddToCart', itemName: 'bacon', price: 5 }, newPlayer);

      expect(createClient('mockUrl', 'mockKey').from).toHaveBeenCalledWith('storeCart');
    });
    it('should remove item from cart', async () => {
      const mockCartData = { data: { name: 'banana', quantity: '10', price: '5' }, error: null };
      (
        createClient('mockUrl', 'mockKey').from('storeCart').select as jest.Mock
      ).mockResolvedValueOnce(mockCartData);

      await testArea.handleCommand({ type: 'RemoveFromCart', itemName: 'banana' }, newPlayer);

      expect(createClient('mockUrl', 'mockKey').from).toHaveBeenCalledWith('storeCart');
    });
    it('should checkout', async () => {
      const mockInventoryData = {
        data: { name: 'cereal', quantity: '5', price: '5' },
        error: null,
      };
      (
        createClient('mockUrl', 'mockKey').from('playerInventory').select('itemList')
          .eq as jest.Mock
      ).mockResolvedValueOnce(mockInventoryData);
      const mockCartData = { data: { name: 'banana', quantity: '10', price: '5' }, error: null };
      (
        createClient('mockUrl', 'mockKey').from('storeCart').select as jest.Mock
      ).mockResolvedValueOnce(mockCartData);

      await testArea.handleCommand({ type: 'CheckOut', itemName: 'cereal' }, newPlayer);

      expect(createClient('mockUrl', 'mockKey').from).toHaveBeenCalledWith('storeCart');
      expect(createClient('mockUrl', 'mockKey').from).toHaveBeenCalledWith('playerInventory');
    });
  });
});
