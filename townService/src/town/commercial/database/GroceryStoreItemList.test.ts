import GroceryStoreItemList from './GroceryStoreItemList';
import GroceryStoreItem from './GroceryStoreItem';

describe('GroceryStoreItemList', () => {
    let itemList: GroceryStoreItemList;

    beforeEach(() => {
        itemList = new GroceryStoreItemList();
    });

    it('should add an item to the list', () => {
        const itemToAdd = new GroceryStoreItem('bacon', 10);
        itemList.addItem(itemToAdd);

        expect(itemList.itemList).toContainEqual(itemToAdd);
    });

    it('should add an item with quantity to the list', () => {
        itemList.addItemWithQuantity('bacon', 5);

        expect(itemList.itemList.length).toBe(1);
        expect(itemList.itemList[0].name).toBe('bacon');
        expect(itemList.itemList[0].quantity).toBe(5);
    });

    it('should add a list of items to the list', () => {
        const itemListToAdd = new GroceryStoreItemList([
            new GroceryStoreItem('bacon', 5),
            new GroceryStoreItem('cereal', 3),
        ]);

        itemList.addItemList(itemListToAdd);

        expect(itemList.itemList.length).toBe(2);
        expect(itemList.itemList).toContainEqual(itemListToAdd.itemList[0]);
        expect(itemList.itemList).toContainEqual(itemListToAdd.itemList[1]);
    });

    it('should remove an item from the list', () => {
        const itemToRemove = new GroceryStoreItem('bacon', 10);
        itemList.addItem(itemToRemove);

        itemList.removeItem(itemToRemove);

        expect(itemList.itemList).not.toContain(itemToRemove);
    });

    it('should remove an item with quantity from the list', () => {
        itemList.addItemWithQuantity('bacon', 10);

        itemList.removeItemWithQuantity('bacon', 5);

        expect(itemList.itemList.length).toBe(1);
        expect(itemList.itemList[0].name).toBe('bacon');
        expect(itemList.itemList[0].quantity).toBe(5);
    });

    it('should remove a list of items from the list', () => {
        const itemListToRemove = new GroceryStoreItemList([
            new GroceryStoreItem('bacon', 5),
            new GroceryStoreItem('cereal', 3),
        ]);
        itemList.addItemList(itemListToRemove);

        itemList.removeItemList(itemListToRemove);

        expect(itemList.itemList.length).toBe(0);
    });

    it('should get the total value of the items in the list', () => {
        itemList.addItemWithQuantity('bacon', 5);
        itemList.addItemWithQuantity('cereal', 3);

        const totalValue = itemList.getItemListTotalValue();

        expect(totalValue).toBe(40);
    });

    it('should check if the list is empty', () => {
        expect(itemList.isEmpty()).toBe(true);

        itemList.addItemWithQuantity('bacon', 5);

        expect(itemList.isEmpty()).toBe(false);
    });
});
