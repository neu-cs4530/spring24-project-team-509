import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  TradingArea as TradingAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import { supabase } from '../../supabaseClient';

export default class TradingArea extends InteractableArea {
  protected _tradingBoard: any[] = [];

  public constructor(
    { id }: Omit<TradingAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  public toModel(): TradingAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'TradingArea',
      tradingBoard: this._tradingBoard,
    };
  }

  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): TradingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new TradingArea({ id: name, occupants: [], tradingBoard: [] }, rect, broadcastEmitter);
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'OpenTradingBoard') {
      console.log('Open Board');
      this._openTradingBoard();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PostTradingOffer') {
      console.log('Post Offer');
      this._postTradingOffer(player.id, player.userName, command.item, command.quantity);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Method not implemented.');
  }

  private async _openTradingBoard(): Promise<void> {
    const { data, error } = await supabase.from('tradingBoard').select();
    if (data) {
      this._tradingBoard = data;
      this._emitAreaChanged();
    }
    if (error) {
      throw new Error('Error fetching store cart');
    }
  }

  private async _postTradingOffer(
    playerID: string,
    playerName: string,
    item: string,
    quantity: number,
  ): Promise<void> {
    const { data, error } = await supabase
      .from('tradingBoard')
      .insert([{ playerID: playerID, playerName: playerName, item: item, quantity: quantity }]);
    if (data) {
      this._tradingBoard = data;
    }
    if (error) {
      throw new Error('Error posting trading offer');
    }
  }
}
