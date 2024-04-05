import { ChakraProvider } from '@chakra-ui/react';
import TownController, * as TownControllerHooks from '../../../classes/TownController';
import { mock, mockReset } from 'jest-mock-extended';
import InventoryAreaController from '../../../classes/interactable/InventoryAreaController';
import { InteractableType } from '../../../types/CoveyTownSocket';
import { nanoid } from 'nanoid';
import PlayerController from '../../../classes/PlayerController';
import { render, screen } from '@testing-library/react';
import TownControllerContext from '../../../contexts/TownControllerContext';
import InventoryAreaWrapper from './Inventory';
import PhaserInventoryArea from './InventoryArea';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { InventoryArea as InventoryAreaModel } from '../../../types/CoveyTownSocket';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

const mockInventoryArea = mock<PhaserInventoryArea>({
  id: nanoid(),
});

mockInventoryArea.name = 'Inventory';
mockInventoryArea.getType.mockReturnValue('inventoryArea');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockInventoryArea);

const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);


class MockInventoryAreaController extends InventoryAreaController {
  mockPlayerItems = [];

  private _type: InteractableType = 'InventoryArea';

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

  toInteractableAreaModel(): InventoryAreaModel {
    if (!this._type) throw new Error('Type not set');
    const ret = mock<InventoryAreaModel>();
    ret.type = this._type;
    return ret;
  }
}

describe('InventoryArea', () => {
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
  const inventoryAreaController = new MockInventoryAreaController();
  let joinAreaResolve: () => void;
  let joinAreaReject: (err: Error) => void;

  function renderInventoryArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <InventoryAreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  beforeEach(() => {
    mockInventoryArea.name = nanoid();
    mockReset(townController);
    useInteractableAreaControllerSpy.mockReturnValue(inventoryAreaController);
    mockToast.mockClear();
  });

  describe('Listeners', () => {
    it('Registers exactly one listeners when mounted: for inventoryAreaUpdated', () => {
      const addListenerSpy = jest.spyOn(inventoryAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderInventoryArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      expect(addListenerSpy).toHaveBeenCalledWith('inventoryAreaUpdated', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(inventoryAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(inventoryAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderInventoryArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <InventoryAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
  });
});
