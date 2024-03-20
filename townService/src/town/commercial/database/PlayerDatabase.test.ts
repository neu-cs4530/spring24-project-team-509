import PlayerDatabase from './PlayerDatabase';
import GroceryStoreItemList from './GroceryStoreItemList';
import GroceryStoreItem from './GroceryStoreItem';
import { PLAYER_INVENTORY_NOT_FOUND_ERROR } from '../errors';

// TODO: trading offer
describe('PlayerDatabase', () => {
  let playerDatabase: PlayerDatabase;

  beforeEach(() => {
    playerDatabase = new PlayerDatabase();
  });

  describe('addToPlayerInventory', () => {
    it("should add items to the player's inventory", () => {
      const playerID = 'player1';
      const items: GroceryStoreItem[] = [
        new GroceryStoreItem('bacon', 10),
        new GroceryStoreItem('cereal', 5),
      ];

      const itemList = new GroceryStoreItemList(items);

      playerDatabase.addToPlayerInventory(playerID, itemList);

      expect(playerDatabase.getPlayerInventory(playerID)).toEqual(itemList);
    });
  });

  describe('removeItemFromPlayerInventory', () => {
    it("should remove an item from the player's inventory", () => {
      const playerID = 'player1';
      const item: GroceryStoreItem = new GroceryStoreItem('bacon', 10);

      playerDatabase.addItemToPlayerInventory(playerID, item);
      playerDatabase.removeItemFromPlayerInventory(playerID, item);

      expect(playerDatabase.getPlayerInventory(playerID)).toEqual(new GroceryStoreItemList());
    });

    it("should throw INVENTORY_NOT_FFOUND when removing from a non-existing player's inventory", () => {
      const playerID = 'player1';
      const item: GroceryStoreItem = new GroceryStoreItem('bacon', 10);

      expect(() => {
        playerDatabase.removeItemFromPlayerInventory(playerID, item);
      }).toThrow(PLAYER_INVENTORY_NOT_FOUND_ERROR);
    });
  });

  describe('removeFromPlayerInventory', () => {
    it("should remove items from the player's inventory", () => {
      const playerID = 'player1';
      const items: GroceryStoreItem[] = [
        new GroceryStoreItem('bacon', 10),
        new GroceryStoreItem('cereal', 5),
      ];

      const itemList = new GroceryStoreItemList(items);

      playerDatabase.addToPlayerInventory(playerID, itemList);
      playerDatabase.removeFromPlayerInventory(playerID, itemList);

      expect(playerDatabase.getPlayerInventory(playerID)).toEqual(new GroceryStoreItemList());
    });

    it("should throw error whenn remove non existing items from the player's inventory", () => {
      const playerID = 'player1';
      const items: GroceryStoreItem[] = [
        new GroceryStoreItem('bacon', 10),
        new GroceryStoreItem('cereal', 5),
      ];
      const itemList = new GroceryStoreItemList(items);

      expect(() => {
        playerDatabase.removeFromPlayerInventory(playerID, itemList);
      }).toThrow(PLAYER_INVENTORY_NOT_FOUND_ERROR);
    });
  });

  describe('addToPlayerCart', () => {
    it("should add an item to the player's cart", () => {
      const playerID = 'player1';
      const item: GroceryStoreItem = new GroceryStoreItem('bacon', 10);

      playerDatabase.addItemToPlayerCart(playerID, item);

      expect(playerDatabase.getPlayerCart(playerID)).toEqual(new GroceryStoreItemList([item]));
    });
  });

  describe('removeFromPlayerCart', () => {
    it("should remove an item from the player's cart", () => {
      const playerID = 'player1';
      const item: GroceryStoreItem = new GroceryStoreItem('bacon', 10);

      playerDatabase.addItemToPlayerCart(playerID, item);
      playerDatabase.removeItemFromPlayerCart(playerID, item);

      expect(playerDatabase.getPlayerCart(playerID)).toEqual(new GroceryStoreItemList());
    });
  });

  describe('addToPlayerPurchaseHistory', () => {
    it("should add items to the player's purchase history", () => {
      const playerID = 'player1';
      const items: GroceryStoreItem[] = [
        new GroceryStoreItem('bacon', 10),
        new GroceryStoreItem('cereal', 5),
      ];

      const itemList = new GroceryStoreItemList(items);

      playerDatabase.addToPlayerPurchaseHistory(playerID, itemList);

      expect(playerDatabase.getPlayerPurchaseHistory(playerID)).toEqual([itemList]);
    });
  });

  describe('PlayerDatabase', () => {
    let database: PlayerDatabase;

    beforeEach(() => {
      database = new PlayerDatabase();
    });

    describe('addItemToPlayerInventory', () => {
      it("should add an item to the player's inventory", () => {
        const playerID = 'player1';
        const item: GroceryStoreItem = new GroceryStoreItem('bacon', 10);

        database.addItemToPlayerInventory(playerID, item);

        expect(database.getPlayerInventory(playerID)).toEqual(new GroceryStoreItemList([item]));
      });
    });

    describe('removeItemFromPlayerInventory', () => {
      it("should throw PLAYER_INVENTORY_NOT_FOUND_ERROR when player's inventory is not found", () => {
        const playerID = 'player1';
        const item: GroceryStoreItem = new GroceryStoreItem('bacon', 10);

        expect(() => {
          playerDatabase.removeItemFromPlayerInventory(playerID, item);
        }).toThrow(PLAYER_INVENTORY_NOT_FOUND_ERROR);
      });
    });
  });

  describe('checkOutPlayerCart', () => {
    it("should add items from the player's cart to the player's inventory", () => {
      const playerID = 'player1';
      const items: GroceryStoreItem[] = [
        new GroceryStoreItem('bacon', 10),
        new GroceryStoreItem('cereal', 5),
      ];

      const itemList = new GroceryStoreItemList(items);

      playerDatabase.addToPlayerCart(playerID, itemList);
      playerDatabase.checkOutPlayerCart(playerID);

      expect(playerDatabase.getPlayerInventory(playerID)).toEqual(itemList);
    });
  });
});
