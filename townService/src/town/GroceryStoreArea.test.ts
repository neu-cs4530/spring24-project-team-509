import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import e from 'express';
import { TownEmitter } from '../types/CoveyTownSocket';
import GroceryStoreArea from './GroceryStoreArea';
import Player from '../lib/Player';
import { supabase } from '../../supabaseClient';

describe('GroceryStoreArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: GroceryStoreArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    testArea = new GroceryStoreArea(
      { id, occupants: [], totalPrice: 0, storeInventory: [], cart: [] },
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
    it('should handle opening the store', async () => {
      const cart = await supabase.from('storeCart').select();
      const inventory = await supabase.from('storeInventory').select();
      await testArea.handleCommand({ type: 'OpenGroceryStore' }, newPlayer);

      await expect(cart.data).toEqual(testArea.toModel().cart);
      await expect(inventory.data).toEqual(testArea.toModel().storeInventory);
    });
    it('should handle adding an item to the cart', async () => {
      const data = await supabase.from('storeCart').select().eq('name', 'bacon');
      let testValue: any[] | null = data.data;
      if (testValue === null) {
        testValue = [];
      } else if (testValue.find(item => item.name === 'bacon') === undefined) {
        testValue.push({ name: 'bacon', price: 5, quantity: 1 });
      } else if (testValue.find(item => item.name === 'bacon') !== undefined) {
        const baconItem = testValue.find(item => item.name === 'bacon');
        if (baconItem) {
          baconItem.quantity += 1;
        }
      }

      await testArea.handleCommand({ type: 'AddToCart', itemName: 'bacon', price: 5 }, newPlayer);
      await expect(testArea.toModel().cart).toEqual(testValue);
    });
    it('should handle removing an item from the cart', async () => {
      const data = await supabase.from('storeCart').select().eq('name', 'bacon');
      let testValue: any[] | null = data.data;
      if (testValue === null) {
        testValue = [];
      } else if (testValue.find(item => item.name === 'bacon') !== undefined) {
        const baconItem = testValue.find(item => item.name === 'bacon');
        if (baconItem) {
          baconItem.quantity -= 1;
        }
      }

      await testArea.handleCommand({ type: 'RemoveFromCart', itemName: 'bacon' }, newPlayer);
      await expect(testArea.toModel().cart).toEqual(testValue);
    });
    it('should handle checking out', async () => {
      const data = await supabase.from('storeCart').select();
      const testValue = data.data;
      await testArea.handleCommand({ type: 'CheckOut' }, newPlayer);
      await expect(testArea.toModel().cart).toEqual([]);
      await expect(testArea.toModel().totalPrice).toBeGreaterThan(0);
    });
  });
});
