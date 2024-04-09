import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import TownController from '../TownController';
import GroceryStoreAreaController, { GroceryStoreAreaEvents } from './GroceryStoreAreaController';
import {
  GroceryStoreArea as GroceryStoreAreaModel,
  InteractableID,
  PlayerLocation,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';

describe('[GroceryStoreAreaController]', () => {
  let groceryStoreArea: GroceryStoreAreaController;
  let groceryStoreModel: GroceryStoreAreaModel;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<GroceryStoreAreaEvents>();
  const interactableID: InteractableID = 'groceryStore001';

  beforeEach(() => {
    groceryStoreModel = {
      id: interactableID,
      occupants: [],
      type: 'GroceryStoreArea',
      totalPrice: 0,
      storeInventory: [],
      cart: [],
      balance: 0,
      history: [], // Add the 'history' property here
    };
    groceryStoreArea = new GroceryStoreAreaController(interactableID, townController);
    mockClear(townController);
    groceryStoreArea.addListener('groceryStoreAreaUpdated', mockListeners.groceryStoreAreaUpdated);
  });

  describe('Initialization', () => {
    it('should initialize with the correct ID and empty state', () => {
      expect(groceryStoreArea.id).toEqual(interactableID);
      expect(groceryStoreArea.totalPrice).toEqual(0);
      expect(groceryStoreArea.storeInventory).toEqual([]);
      expect(groceryStoreArea.cart).toEqual([]);
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
      groceryStoreArea.occupants = [new PlayerController('player001', 'player001', playerLocation)];
      groceryStoreArea["_updateFrom"](groceryStoreModel);
      expect(groceryStoreArea.isActive()).toBeTruthy();
    });

    it('should return false if there are no occupants', () => {
      expect(groceryStoreArea.isActive()).toBeFalsy();
    });
  });

  describe('handleOpenGroceryStore method', () => {
    it('should call sendInteractableCommand with the correct command type', async () => {
      await groceryStoreArea.handleOpenGroceryStore();
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'OpenGroceryStore',
      });
    });
  });

  describe('handleAddItem method', () => {
    it('should call sendInteractableCommand to add an item to the cart', async () => {
      const itemName = 'Milk';
      const price = 3;
      await groceryStoreArea.handleAddItem(itemName, price);
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'AddToCart',
        itemName,
        price,
      });
    });
  });

  describe('handleRemoveItem method', () => {
    it('should call sendInteractableCommand to remove an item from the cart', async () => {
      const itemName = 'Milk';
      await groceryStoreArea.handleRemoveItem(itemName);
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'RemoveFromCart',
        itemName,
      });
    });
  });

  describe('handleCheckout method', () => {
    it('should call sendInteractableCommand for checkout', async () => {
      await groceryStoreArea.handleCheckout();
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'CheckOut',
      });
    });
  });

  describe('Event Emissions on Update', () => {
    it('should emit groceryStoreAreaUpdated event on update', () => {
      groceryStoreArea["_updateFrom"]({ ...groceryStoreModel, totalPrice: 20 });
      expect(mockListeners.groceryStoreAreaUpdated).toHaveBeenCalled();
    });
    it('should update everything with the updateFrom', () => {
      const updatedGroceryStore: GroceryStoreAreaModel = {
        id: interactableID,
        occupants: [],
        type: 'GroceryStoreArea',
        totalPrice: 20,
        storeInventory: [{ name: 'Milk', price: 3 }],
        cart: [{ name: 'Milk', price: 3, quantity: 1 }],
        balance: 20,
        history: [],
      };
      groceryStoreArea["_updateFrom"](updatedGroceryStore);
      expect(groceryStoreArea.totalPrice).toEqual(20);
      expect(groceryStoreArea.storeInventory).toEqual([{ name: 'Milk', price: 3 }]);
      expect(groceryStoreArea.cart).toEqual([{ name: 'Milk', price: 3, quantity: 1 }]);
      expect(groceryStoreArea.balance).toEqual(20);
    });
  });
});
