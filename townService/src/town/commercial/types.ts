// TODO: define the GroceryStoreItemNames like "pizza", "apple"
export type GroceryStoreItemName =
  | 'bacon'
  | 'cereal'
  | 'donut'
  | 'egg'
  | 'fish'
  | 'grape'
  | 'honey'
  | 'juice'
  | 'ketchup'
  | 'lemon';

// TODO: define the groceryStoreItemPrices
export const groceryStoreItemPrices = {
  bacon: 5,
  cereal: 5,
  donut: 1,
  egg: 4,
  fish: 15,
  grape: 8,
  honey: 7,
  juice: 4,
  ketchup: 4,
  lemon: 1,
};

// Commented out but just to have a copy here
// // TODO: interactable command for opening the grocery store
// export type InteractableCommand =
//   | OpenGroceryStoreCommand
//   | AddToCartCommand
//   | RemoveFromCartCommand
//   | CheckOutCommand;

// export interface OpenGroceryStoreCommand {
//   type: 'OpenGrocery';
// }
// export interface AddToCartCommand {
//   type: 'AddToCart';
//   item: GroceryStoreItem;
// }
// export interface RemoveFromCartCommand {
//   type: 'RemoveFromCart';
//   item: GroceryStoreItem;
// }
// export interface CheckOutCommand {
//   type: 'CheckOut';
// }
