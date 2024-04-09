import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  InventoryArea as InventoryAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  GroceryItem,
} from '../types/CoveyTownSocket';
import Player from '../lib/Player';
import { supabase } from '../../supabaseClient';

/**
 * A class representing an inventory area in a CoveyTown.
 * Inventory areas are areas where players can view their inventory.
 * Players can view their inventory by interacting with the inventory area.
 * Inventory areas are interactable areas.
 */
export default class InventoryArea extends InteractableArea {
  protected _playerInventory: GroceryItem[] = [];

  /**
   * Constructs a new InventoryArea.
   * @param id The ID of the inventory area.
   * @param coordinates The coordinates of the inventory area.
   * @param townEmitter The TownEmitter used to emit events to the town.
   */
  public constructor(
    { id }: Omit<InventoryAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  /**
   * Converts the InventoryArea to an InventoryAreaModel.
   * @returns The InventoryAreaModel representing the InventoryArea.
   */
  public toModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'InventoryArea',
      playerInventory: this._playerInventory,
    };
  }

  /**
   * Creates an InventoryArea from a map object.
   * @param mapObject The map object to create the InventoryArea from.
   * @param broadcastEmitter The TownEmitter used to emit events to the town.
   * @returns The InventoryArea created from the map object.
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): InventoryArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new InventoryArea(
      { id: name, occupants: [], playerInventory: [] },
      rect,
      broadcastEmitter,
    );
  }

  /**
   * Handle a command from a player in this inventory area.
   * Supported commands:
   * - OpenInventoryCommand
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   * to notify any listeners of a state update, including any change to inventory)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'OpenInventory') {
      this._openInventory(player.id);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Method not implemented.');
  }

  /**
   * Opens the inventory of a player.
   * @param playerID The ID of the player whose inventory to open.
   * @returns A promise that resolves when the inventory is opened.
   */
  private async _openInventory(playerID: string): Promise<void> {
    const { data, error } = await supabase
      .from('playerInventory')
      .select()
      .eq('playerID', playerID);
    let inventoryList: GroceryItem[] = [];
    if (data && data.length > 0) {
      inventoryList = JSON.parse(data[0].itemList);
    }
    if (error) {
      throw new Error(error.message);
    }
    this._playerInventory = inventoryList;
    this._emitAreaChanged();
  }
}
