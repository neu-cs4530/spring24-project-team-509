import { Button, ChakraProvider } from '@chakra-ui/react';
import TownController, * as TownControllerHooks from '../../../classes/TownController';
import { mock, mockReset } from 'jest-mock-extended';
import { InteractableType, TradingArea } from '../../../types/CoveyTownSocket';
import { nanoid } from 'nanoid';
import PlayerController from '../../../classes/PlayerController';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TownControllerContext from '../../../contexts/TownControllerContext';
import React from 'react';
import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import PhaserTradingArea from './TradingArea';
import TradingAreaWrapper, { TradingBoard } from './TradingBoard';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

const mockTradingBoard = mock<PhaserTradingArea>({
  id: nanoid(),
});

mockTradingBoard.name = 'Trading Board';
mockTradingBoard.getType.mockReturnValue('tradingArea');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockTradingBoard);

const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

class MockTradingAreaController extends TradingAreaController {
  mockPlayerItems = [];

  private _type: InteractableType = 'TradingArea';

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

  toInteractableAreaModel(): TradingArea {
    if (!this._type) throw new Error('Type not set');
    const ret = mock<TradingArea>();
    ret.type = this._type;
    return ret;
  }
}

describe('TradingArea', () => {
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
  let tradingAreaController = new MockTradingAreaController();
  async function checkBoard({
    clickable,
    checkMakeMove,
    checkToast,
  }: {
    clickable?: boolean;
    checkMakeMove?: boolean;
    checkToast?: boolean;
  }) {
    tradingAreaController.mockReset();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  }

  function renderTradingArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <TradingAreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  beforeEach(() => {
    mockTradingBoard.name = nanoid();
    mockReset(townController);
    useInteractableAreaControllerSpy.mockReturnValue(tradingAreaController);
    mockToast.mockClear();
  });

  describe('Listeners', () => {
    it('Registers exactly one listeners when mounted: for tradingAreaUpdated', () => {
      const addListenerSpy = jest.spyOn(tradingAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderTradingArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      expect(addListenerSpy).toHaveBeenCalledWith('tradingAreaUpdated', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(tradingAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(tradingAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderTradingArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <TradingAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });

    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(tradingAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(tradingAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderTradingArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      const addedListeners = addListenerSpy.mock.calls;
      const addedTradingUpdateListener = addedListeners.find(
        call => call[0] === 'tradingAreaUpdated',
      );
      expect(addedTradingUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(1);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedTradingUpdateListener = removedListeners.find(
        call => call[0] === 'tradingAreaUpdated',
      );
      expect(removedTradingUpdateListener).toEqual(addedTradingUpdateListener);
    });

    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(tradingAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(tradingAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderTradingArea();
      expect(addListenerSpy).toBeCalledTimes(1);

      tradingAreaController = new MockTradingAreaController();
      const removeListenerSpy2 = jest.spyOn(tradingAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(tradingAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(tradingAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <TradingAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(1);

      expect(addListenerSpy2).toBeCalledTimes(1);
      expect(removeListenerSpy2).toBeCalledTimes(0);
    });
  });
  it('Displays all the words in the trading area', () => {
    const { getByText } = renderTradingArea();
    expect(getByText('Trading Board')).toBeInTheDocument();
    expect(getByText('Request an Item')).toBeInTheDocument();
    expect(getByText('Which item will you offer:')).toBeInTheDocument();
    expect(getByText('How much of it:')).toBeInTheDocument();
    expect(getByText('Which item do you desire:')).toBeInTheDocument();
    expect(getByText('How much of it?:')).toBeInTheDocument();
    expect(getByText('Inventory Board')).toBeInTheDocument();
  });

  it('Displays the trading area inventory', () => {
    const { queryAllByText } = renderTradingArea();
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

  // Test the post item function
  it('Posts an item from the trading area', async () => {
    const { getByText } = renderTradingArea();
    const requestButton = getByText('Post');
    requestButton.click();
    // print the error message
    const handlePostItem = jest.fn();
    handlePostItem.mockRejectedValueOnce(new Error('Mock error'));
    // Wait for the error handling to complete
    await waitFor(() => {
      // Ensure that toast function was called with the correct parameters
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error post item',
        description:
          'There is an error in posting the item. Please check the item name and quantity',
        status: 'error',
      });
    });
  });

  // Test the post item text function actually posts the item
  it('allows users to input values for post item, post quantity, desire item, and desire quantity', async () => {
    // Render the TradingBoard component
    const { getByPlaceholderText, getByText } = render(
      <TradingBoard interactableID='your-interactable-id' />,
    );

    // Mock input for post item
    const postItemInput = getByPlaceholderText('Offer item');
    fireEvent.change(postItemInput, { target: { value: 'Apple' } });

    // Mock input for post quantity
    const postQuantityInput = getByPlaceholderText('Offer quantity');
    fireEvent.change(postQuantityInput, { target: { value: '5' } });

    // Mock input for desire item
    const desireItemInput = getByPlaceholderText('Desire item');
    fireEvent.change(desireItemInput, { target: { value: 'Banana' } });

    // Mock input for desire quantity
    const desireQuantityInput = getByPlaceholderText('Desire quantity');
    fireEvent.change(desireQuantityInput, { target: { value: '3' } }); // Change value to a string

    // Click the post button
    const handlePostItem = jest.fn();
    render(<Button> onClick = {handlePostItem} Post </Button>);
    const postButton = getByText('Post');
    postButton.click();
    //fireEvent.click(postButton);
    expect(postItemInput).toHaveValue('');
    expect(postQuantityInput).toHaveValue('');
    expect(desireItemInput).toHaveValue('');
    expect(desireQuantityInput).toHaveValue('');

    // Checks after clicking "post", the items appear in the trading area

    // expect(mockTradingBoard.postItem).toHaveBeenCalledWith('Apple', 5, 'Banana', 3);
    const handleAcceptTradingOffer = jest.fn();
    render(<Button> onClick = {handleAcceptTradingOffer} Accept </Button>);
    const acceptButton = getByText('Accept');
    acceptButton.click();
    handleAcceptTradingOffer.mockRejectedValueOnce(new Error('Mock error'));
    // Wait for the error handling to complete
    await waitFor(() => {
      // Ensure that toast function was called with the correct parameters
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error accept trade',
        description: 'There is an error in accepting the trade. Please try again',
        status: 'error',
      });
    });
  });

  it('checks that the delete button removes the offer from the table', async () => {
    // after clicking accept, the items should be removed from the trading area
    const mockTradingOffers = [
      {
        playerName: 'Alice',
        item: 'Apple',
        quantity: 2,
        itemDesire: 'Banana',
        quantityDesire: 1,
        playerID: '123',
      },
      // ... more offers
    ];
    const mockHandleDeleteOffer = jest.fn();
    const renderTradingBoardWithMocks = () => {
      return render(<TradingBoard interactableID='test-id' />);
    };
    renderTradingBoardWithMocks();
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(mockHandleDeleteOffer).toHaveBeenCalledWith('123');
      const aliceOfferRow = screen.queryByText('Alice');
      expect(aliceOfferRow).not.toBeInTheDocument();
    });
  });
});
