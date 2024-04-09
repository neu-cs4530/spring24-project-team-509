import { ChakraProvider } from '@chakra-ui/react';
import TownController, * as TownControllerHooks from '../../../classes/TownController';
import { mock, mockReset } from 'jest-mock-extended';
import { GroceryStoreArea, InteractableType } from '../../../types/CoveyTownSocket';
import { nanoid } from 'nanoid';
import PlayerController from '../../../classes/PlayerController';
import { render } from '@testing-library/react';
import TownControllerContext from '../../../contexts/TownControllerContext';
import React from 'react';
import PhaserGroceryStoreArea from './GroceryStoreArea';
import GroceryStoreAreaController from '../../../classes/interactable/GroceryStoreAreaController';
import GroceryStoreAreaWrapper from './GroceryStoreMenu';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

const mockGroceryStoreArea = mock<PhaserGroceryStoreArea>({
  id: nanoid(),
});

mockGroceryStoreArea.name = 'Menu';
mockGroceryStoreArea.getType.mockReturnValue('groceryStoreArea');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGroceryStoreArea);

const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

class MockGroceryStoreAreaController extends GroceryStoreAreaController {
  mockPlayerItems = [];

  private _type: InteractableType = 'GroceryStoreArea';

  private _mockID: string;

  public constructor() {
    const id = nanoid();
    super(id, mock<TownController>());
    this._mockID = id;
  }

  get type(): string {
    return this._type;
  }

  get friendlyName(): string {
    return this.id;
  }

  public isActive(): boolean {
    return true;
  }

  public mockReset() {
    this.mockPlayerItems = [];
  }

  get mockID(): string {
    return this.mockID;
  }

  get playerItems(): string[] {
    return this.mockPlayerItems;
  }

  toInteractableAreaModel(): GroceryStoreArea {
    if (!this._type) throw new Error('Type not set');
    const ret = mock<GroceryStoreArea>();
    ret.type = this._type;
    return ret;
  }
}

describe('GroceryStoreArea', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  let groceryStoreAreaController = new MockGroceryStoreAreaController();

  function renderGroceryStoreArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <GroceryStoreAreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  beforeEach(() => {
    mockGroceryStoreArea.name = nanoid();
    mockReset(townController);
    useInteractableAreaControllerSpy.mockReturnValue(groceryStoreAreaController);
    mockToast.mockClear();
  });

  describe('Listeners', () => {
    it('Registers exactly one listeners when mounted: for groceryStoreAreaUpdated', () => {
      const addListenerSpy = jest.spyOn(groceryStoreAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderGroceryStoreArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      expect(addListenerSpy).toHaveBeenCalledWith('groceryStoreAreaUpdated', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(groceryStoreAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(groceryStoreAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderGroceryStoreArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <GroceryStoreAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
  });

  it('Removes the listeners when the component is unmounted', () => {
    const removeListenerSpy = jest.spyOn(groceryStoreAreaController, 'removeListener');
    const addListenerSpy = jest.spyOn(groceryStoreAreaController, 'addListener');
    addListenerSpy.mockClear();
    removeListenerSpy.mockClear();
    const renderData = renderGroceryStoreArea();
    expect(addListenerSpy).toBeCalledTimes(1);
    const addedListeners = addListenerSpy.mock.calls;
    const addedGroceryStoreUpdateListener = addedListeners.find(
      call => call[0] === 'groceryStoreAreaUpdated',
    );
    expect(addedGroceryStoreUpdateListener).toBeDefined();
    renderData.unmount();
    expect(removeListenerSpy).toBeCalledTimes(1);
    const removedListeners = removeListenerSpy.mock.calls;
    const removedGroceryStoreUpdateListener = removedListeners.find(
      call => call[0] === 'groceryStoreAreaUpdated',
    );
    expect(removedGroceryStoreUpdateListener).toEqual(addedGroceryStoreUpdateListener);
  });

  it('Creates new listeners if the gameAreaController changes', () => {
    const removeListenerSpy = jest.spyOn(groceryStoreAreaController, 'removeListener');
    const addListenerSpy = jest.spyOn(groceryStoreAreaController, 'addListener');
    addListenerSpy.mockClear();
    removeListenerSpy.mockClear();
    const renderData = renderGroceryStoreArea();
    expect(addListenerSpy).toBeCalledTimes(1);

    groceryStoreAreaController = new MockGroceryStoreAreaController();
    const removeListenerSpy2 = jest.spyOn(groceryStoreAreaController, 'removeListener');
    const addListenerSpy2 = jest.spyOn(groceryStoreAreaController, 'addListener');

    useInteractableAreaControllerSpy.mockReturnValue(groceryStoreAreaController);
    renderData.rerender(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <GroceryStoreAreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
    expect(removeListenerSpy).toBeCalledTimes(1);

    expect(addListenerSpy2).toBeCalledTimes(1);
    expect(removeListenerSpy2).toBeCalledTimes(0);
  });

  it('Displays the grocery store area', () => {
    const { getByText } = renderGroceryStoreArea();
    expect(getByText('Grocery Store')).toBeInTheDocument();
  });

  it('Displays the cart', () => {
    const { getByText } = renderGroceryStoreArea();
    expect(getByText('Cart')).toBeInTheDocument();
  });

  it('Displays the grocery store area inventory', () => {
    const { queryAllByText } = renderGroceryStoreArea();
    const itemNames = queryAllByText('Item Name');
    const prices = queryAllByText('Price');
    const quantities = queryAllByText('Quantity');

    // Ensure there's at least one element with the text 'Item Name'
    expect(itemNames.length).toBeGreaterThan(0);
    expect(prices.length).toBeGreaterThan(0);
    expect(quantities.length).toBeGreaterThan(0);

    // Iterate over each element and make assertions
    itemNames.forEach(itemName => {
      expect(itemName).toBeInTheDocument();
    });
    prices.forEach(price => {
      expect(price).toBeInTheDocument();
    });
    quantities.forEach(quantity => {
      expect(quantity).toBeInTheDocument();
    });
  });

  // Test the handleAddItem function
  it('Adds an item to the cart', async () => {
    const { queryAllByText } = renderGroceryStoreArea();
    const adds = queryAllByText('Add');

    adds.forEach(add => {
      add.click();
      expect(mockToast).toBeCalledWith({
        title: 'Error adding item',
        description: 'Not enough balance',
        status: 'error',
      });
    });
  });

  // Test the handleCheckout function
  it('Checks out the cart', async () => {
    const { getByText } = renderGroceryStoreArea();
    const checkoutButton = getByText('Checkout');
    checkoutButton.click();
  });
});
