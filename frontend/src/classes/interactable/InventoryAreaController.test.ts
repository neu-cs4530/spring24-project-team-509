import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import TownController from '../TownController';
import InventoryAreaController, { InventoryAreaEvents } from './InventoryAreaController';
import { InventoryArea as InventoryAreaModel, PlayerLocation } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';

describe('[InventoryAreaController]', () => {
  let inventoryArea: InventoryAreaController;
  let inventoryModel: InventoryAreaModel;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<InventoryAreaEvents>();
  const interactableID = 'inventory001';

  beforeEach(() => {
    inventoryModel = {
      id: interactableID,
      occupants: [],
      type: 'InventoryArea',
      playerInventory: [],
    };
    inventoryArea = new InventoryAreaController(interactableID, townController);
    mockClear(townController);
    inventoryArea.addListener('inventoryAreaUpdated', mockListeners.inventoryAreaUpdated);
  });

  describe('Initialization', () => {
    it('should initialize with the correct ID and empty inventory', () => {
      expect(inventoryArea.id).toEqual(interactableID);
      expect(inventoryArea.playerInventory).toEqual([]);
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
      inventoryModel.occupants.push('player1');
      inventoryArea.updateFrom(inventoryModel, [
        new PlayerController('player1', 'player1', playerLocation),
      ]);
      expect(inventoryArea.isActive()).toBeTruthy();
    });

    it('should return false if there are no occupants', () => {
      expect(inventoryArea.isActive()).toBeFalsy();
    });
  });

  describe('handleOpenInventory method', () => {
    it('should call sendInteractableCommand with the correct command type', async () => {
      await inventoryArea.handleOpenInventory();
      expect(townController.sendInteractableCommand).toHaveBeenCalledWith(interactableID, {
        type: 'OpenInventory',
      });
    });
  });

  describe('Updating player inventory', () => {
    it('should update the player inventory and emit an event when inventory changes', () => {
      const updatedInventory = {
        id: interactableID,
        occupants: [],
        type: 'InventoryArea',
        playerInventory: ['something'],
      };
      inventoryArea.updateFrom(updatedInventory as InventoryAreaModel, []);
      expect(inventoryArea.playerInventory).toEqual(['something']);
      expect(inventoryArea.id).toEqual(interactableID);
      expect(inventoryArea.occupants).toEqual([]);
      expect(mockListeners.inventoryAreaUpdated).toHaveBeenCalled();
    });
  });
  describe('Updating player inventory', () => {
    it('should not emit an inventoryAreaUpdated event if the inventory does not change', () => {
      mockClear(mockListeners.inventoryAreaUpdated);
      inventoryArea.updateFrom(inventoryArea.toInteractableAreaModel(), []);
      expect(mockListeners.inventoryAreaUpdated).not.toHaveBeenCalled();
    });
  });
});
