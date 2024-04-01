import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  InventoryArea as InventoryAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import Player from '../lib/Player';
import { supabase } from '../../supabaseClient';

export default class InventoryArea extends InteractableArea {
  protected _playerInventory: any[] = [];

  public constructor(
    { id }: Omit<InventoryAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  public toModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'InventoryArea',
      playerInventory: this._playerInventory,
    };
  }

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

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'OpenInventory') {
      console.log('Open Inventory');
      this._openInventory(player.id);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Method not implemented.');
  }

  private async _openInventory(playerID: string): Promise<void> {
    const { data, error } = await supabase
      .from('playerInventory')
      .select()
      .eq('playerID', playerID);
    let inventoryList: { name: any; price: any; quantity: any }[] = [];
    if (data && data.length > 0) {
      inventoryList = JSON.parse(data[0].itemList);
    }
    this._playerInventory = inventoryList;
    this._emitAreaChanged();
  }
}
