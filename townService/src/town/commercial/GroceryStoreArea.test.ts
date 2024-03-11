import GroceryStoreArea from './GroceryStoreArea';
import PlayerDatabase from './database/PlayerDatabase';
import { BoundingBox, Interactable, InteractableCommand, InteractableCommandReturnType, PlayerID, TownEmitter } from '../../types/CoveyTownSocket';
import CommercialArea from './CommercialArea';
import Player from '../../lib/Player';
import GroceryStoreItemList from './database/GroceryStoreItemList';
import ConnectFourGameArea from '../games/ConnectFourGameArea';

class TestingStore extends CommercialArea {
    private _groceryinventory = new Map<String, ArrayList<Number, Number>>();
    public toModel(): Interactable {
        throw new Error('Method not implemented.');
    }
    public handleCommand<CommandType extends InteractableCommand>(command: CommandType, player: Player): InteractableCommandReturnType<CommandType> {
            throw new Error('Method not implemented.');
    }
    public constructor(id: string, playerDatabase: Map<PlayerID, Map<string, [Number,Number]>>) {
        super(id);
        this._playerDatabase = playerDatabase;
    }
    public _initializeGroceryStoreInventory(): Map<String, List<Number, Number>> {    
        return groceryinventory = new Map<String, List<Number, Number>>();
    }
  
    public _restockItems() {
        for (const item of this._groceryStoreInventory.value[0]) {
            if (item.quantity === 0) {
                item.setQuantity(10);
            }
        }
    }

    public _addItemsToInventory(itemList: Map<String, List<Number, Number>>) {
        this._groceryinventory.push(itemList);
    }
    
    public _removeItemsFromInventory(itemList: Map<String, List<Number, Number>> ) {
        this._groceryinventory.remove(itemList);
    }

    public _checkOut(player: Player) {
        
    }
  }
  describe('ConnectFourGameArea', () => {
    let commercialArea: CommercialArea;
    let player: Player;
    let interactableUpdateSpy: jest.SpyInstance;
    const commercialConstructorSpy = jest.spyOn(CommercialModule, 'default');
    let store: TestingStore;
    let playerDatabase: PlayerDatabase;
    let townEmitter: TownEmitter;
    const boundingBox: BoundingBox = {
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    beforeEach(() => {
      playerDatabase = new PlayerDatabase();
      store = new TestingStore('id', playerDatabase);
    });

  describe('_initializeGroceryStoreInventory', () => {
    it('should initialize the grocery store inventory with items', () => {
      const groceryStoreInventory = groceryStoreArea.initializeGroceryStoreInventory();
      expect(groceryStoreInventory).toBeDefined();
      // Add more assertions to validate the initialized grocery store inventory
    });
  });

  describe('_restockItems', () => {
    it('should restock the grocery store with items', () => {
      // Add test case to verify the restocking logic

    describe('_restockItems', () => {
        it('should restock the grocery store with items', () => {
            const initialInventory = groceryStoreArea.toModel().inventory;
            
            // Restock the grocery store
            groceryStoreArea._restockItems();
            
            // Get the updated inventory after restocking
            const updatedInventory = groceryStoreArea.toModel().inventory;
            
            // Verify that the quantity of each item has increased by 10
            for (const itemName in initialInventory) {
                expect(updatedInventory[itemName].quantity).toBe(initialInventory[itemName].quantity + 10);
            }
        });
    });
  });

  describe('_addItemsToInventory', () => {
    beforeEach(() => 
    )
    it('should add items to the grocery store inventory', () => {
      const bacon1 = new GroceryStoreItem('bacon', 10);
      const leek1 = new GroceryStoreItem('leek', 5);
      const garlic1 = new GroceryStoreItem('Knife', 9);

      
    });
  });

  describe('_removeItemsFromInventory', () => {
    it('should remove items from the grocery store inventory', () => {
      // Add test case to verify the item removal logic
    });
  });

  describe('_checkOut', () => {
    it("should check out a player's cart", () => {
      // Add test case to verify the checkout logic
    });
  });

  describe('toModel', () => {
    it('should convert the grocery store into a model', () => {
      // Add test case to verify the model conversion logic
    });
  });

  describe('handleCommand', () => {
    it('should handle the command from the player', () => {
      // Add test case to verify the command handling logic
    });
  });
});
