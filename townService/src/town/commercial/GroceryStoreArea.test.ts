import GroceryStoreArea from './GroceryStoreArea';
import { nanoid } from 'nanoid';
import PlayerDatabase from './database/PlayerDatabase';
import { TownEmitter } from '../../types/CoveyTownSocket';
import GroceryStoreItemList from './database/GroceryStoreItemList';
import Player from '../../lib/Player';
import { mock, mockClear } from 'jest-mock-extended';
import { getLastEmittedEvent } from '../../TestUtils';
import GroceryStoreItem from './database/GroceryStoreItem';

describe('GroceryStoreArea', () => {
  let groceryStoreArea: GroceryStoreArea;
  const playerDatabase = new PlayerDatabase();
  const townEmitter = mock<TownEmitter>();
  const boundingBox = { x: 100, y: 100, width: 100, height: 100 };
  const id = nanoid();
  let items: GroceryStoreItemList;
  let newPlayer: Player;
  //let interactableUpdateSpy: jest.SpyInstance;

  beforeEach(() => {
    mockClear(townEmitter);
    groceryStoreArea = new GroceryStoreArea({ id, occupants: [] }, boundingBox, townEmitter, playerDatabase);
    items = new GroceryStoreItemList();
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    groceryStoreArea.add(newPlayer);
    //interactableUpdateSpy = jest.spyOn(groceryStoreArea, '_emitAreaChanged');
  });

  it('should initialize the grocery store inventory', () => {
    expect(groceryStoreArea.groceryStoreInventory).toBeDefined();
  });

  // it('should restock the grocery store with items', () => {
  //   const initialInventory = groceryStoreArea['_groceryStoreInventory'];
  //   groceryStoreArea['_restockItems']();
  //   expect(groceryStoreArea['_groceryStoreInventory']).not.toEqual(initialInventory);
  // });

  // it('should add items to the grocery store inventory', () => {
  
  //   groceryStoreArea['_addItemsToInventory'](items);
  //   expect(groceryStoreArea['_groceryStoreInventory']).toContainEqual(items);
  // });

  // it('should remove items from the grocery store inventory', () => {
    

  //   groceryStoreArea['_addItemsToInventory'](items);
  //   groceryStoreArea['_removeItemsFromInventory'](items);
  //   expect(groceryStoreArea['_groceryStoreInventory']).not.toContainEqual(items);
  // });

  it('should model the grocery store area', () => {
    const model = groceryStoreArea.toModel();
    expect(model).toEqual({
      id,
      inventory: groceryStoreArea['_groceryStoreInventory'],
      occupants: [newPlayer.id],
      type: 'GroceryStoreArea',
    });
  });

  describe('GroceryStoreArea', () => {
    describe('add', () => {
      it('should add a player to the trading area', () => {
        expect(groceryStoreArea.occupantsByID).toEqual([newPlayer.id]);
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id,
          inventory: groceryStoreArea['_groceryStoreInventory'],
          occupants: [newPlayer.id],
          type: 'GroceryStoreArea',
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
        groceryStoreArea.add(extraPlayer);
        groceryStoreArea.remove(newPlayer);

        expect(groceryStoreArea.occupantsByID).toEqual([extraPlayer.id]);
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id,
          inventory: groceryStoreArea['_groceryStoreInventory'],
          occupants: [extraPlayer.id],
          type: 'GroceryStoreArea',
        });
      });
      it("Clears the player's label and emits an update for their location", () => {
        groceryStoreArea.remove(newPlayer);
        expect(newPlayer.location.interactableID).toBeUndefined();
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.location.interactableID).toBeUndefined();
      });
    });
  });

  describe('handleCommand', () => {
    it('should handle a open store command from a player', () => {
      let player1 = new Player(nanoid(), mock<TownEmitter>());
      groceryStoreArea.handleCommand({ type: 'OpenGroceryStore' }, player1);
      expect(player1.location.interactableID).toEqual(groceryStoreArea.id);
      //expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(groceryStoreArea.occupantsByID).toEqual([newPlayer.id, player1.id]);
    });

    it('should handle an add to cart command from a player', () => {
      const item =  new GroceryStoreItem('bacon', 1);
      const itemList = new GroceryStoreItemList([item]);
      groceryStoreArea.handleCommand({ type: 'AddToCart', item }, newPlayer);
      expect(playerDatabase.getPlayerCart(newPlayer.id).itemList).toEqual(itemList.itemList);
    });

    it('should handle a remove from cart command from a player', () => {
      const item =  new GroceryStoreItem('bacon', 1);
      const itemList = new GroceryStoreItemList([item]);
      groceryStoreArea.handleCommand({ type: 'AddToCart', item }, newPlayer);
      expect(playerDatabase.getPlayerCart(newPlayer.id).itemList).toEqual(itemList.itemList);
      groceryStoreArea.handleCommand({ type: 'RemoveFromCart', item }, newPlayer);
      expect(playerDatabase.getPlayerCart(newPlayer.id).itemList).toEqual([]);
    });

    it('should handle a checkout command from a player', () => {
      const item =  new GroceryStoreItem('bacon', 1);
      const itemList = new GroceryStoreItemList([item]);
      groceryStoreArea.handleCommand({ type: 'AddToCart', item }, newPlayer);
      expect(playerDatabase.getPlayerCart(newPlayer.id).itemList).toEqual(itemList.itemList);
      groceryStoreArea.handleCommand({ type: 'CheckOut' }, newPlayer);
      expect(playerDatabase.getPlayerCart(newPlayer.id).itemList).toEqual([]);
      expect(playerDatabase.getPlayerBalance(newPlayer.id)).toEqual(95);
      expect(playerDatabase.getPlayerInventory(newPlayer.id).itemList).toEqual(itemList.itemList);
    });


    it('should throw an error for an invalid command from a player', () => {
      const invalidCommand = {} as any;
      const player = {} as any;
      expect(() => groceryStoreArea.handleCommand(invalidCommand, player)).toThrowError();
    });
  });



  
});
