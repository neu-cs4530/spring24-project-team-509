import GroceryStoreItem from './GroceryStoreItem';
import { GroceryStoreItemName, groceryStoreItemPrices } from '../types';
import { MODIFY_ITEM_QUANTITY_ERROR, NEGATIVE_ITEM_QUANTITY_ERROR } from '../errors';

describe('GroceryStoreItem', () => {
    let groceryStoreItem: GroceryStoreItem;

    beforeEach(() => {
        groceryStoreItem = new GroceryStoreItem('bacon', 10);
    });

    it('should create a new GroceryStoreItem instance', () => {
        expect(groceryStoreItem).toBeInstanceOf(GroceryStoreItem);
        expect(groceryStoreItem.name).toBe('bacon');
        expect(groceryStoreItem.price).toBe(groceryStoreItemPrices['bacon']); 
        expect(groceryStoreItem.quantity).toBe(10);
    });

    it('should check if the item is the item we are looking for', () => {
        expect(groceryStoreItem.isItem('bacon')).toBe(true);
        expect(groceryStoreItem.isItem('cereal')).toBe(false);
    });

    it('should add quantity to the item', () => {
        groceryStoreItem.addQuantity(5);
        expect(groceryStoreItem.quantity).toBe(15);
    });

    it('should throw an error when adding a negative quantity', () => {
        expect(() => groceryStoreItem.addQuantity(-5)).toThrow(MODIFY_ITEM_QUANTITY_ERROR);
    });

    it('should remove quantity from the item', () => {
        groceryStoreItem.removeQuantity(3);
        expect(groceryStoreItem.quantity).toBe(7);
    });

    it('should throw an error when removing a negative quantity', () => {
        expect(() => groceryStoreItem.removeQuantity(-3)).toThrow(MODIFY_ITEM_QUANTITY_ERROR);
    });

    it('should throw an error when removing more quantity than available', () => {
        expect(() => groceryStoreItem.removeQuantity(15)).toThrow(NEGATIVE_ITEM_QUANTITY_ERROR);
    });

    it('should calculate the total value of the item', () => {
        expect(groceryStoreItem.itemTotalValue).toBe(10 * groceryStoreItemPrices['bacon']); // Update with the actual calculation
    });
});
