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

export default class InventoryArea extends InteractableArea {
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
      return new InventoryArea({ id: name, occupants: [] }, rect, broadcastEmitter);
    }
  
    public handleCommand<CommandType extends InteractableCommand>(
      command: CommandType,
      player: Player,
    ): InteractableCommandReturnType<CommandType> {
      throw new Error('Method not implemented.');
    }
  }
  