import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import { TownEmitter, BoundingBox } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import ConnectFourGameArea from '../games/ConnectFourGameArea';
import TicTacToeGameArea from '../games/TicTacToeGameArea';
import PlayerDatabase from './database/PlayerDatabase';
import GroceryStoreArea from './GroceryStoreArea';
import TradingArea from './TradingArea';

/**
 *
 * @param mapObject
 * @param broadcastEmitter
 * @returns
 */
export default class CommercialAreaFactory {
  private _playerDatabase: PlayerDatabase;

  private _groceryStoreArea: GroceryStoreArea;

  private _tradingArea: TradingArea;

  constructor(broadcastEmitter: TownEmitter) {
    // const { name, width, height } = mapObject;
    // if (!width || !height) {
    //   throw new Error(`Malformed viewing area ${name}`);
    // }
    // const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    // const gameType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
    // this._playerDatabase = new PlayerDatabase();
    // // this._groceryStoreArea = new GroceryStoreArea(name, rect, broadcastEmitter);
    // // this._tradingArea = new TradingArea(name, rect, broadcastEmitter);

    const boundingBox = { x: 100, y: 100, width: 100, height: 100 };
    const id = nanoid();

    // set up the areas
    this._playerDatabase = new PlayerDatabase();
    this._groceryStoreArea = new GroceryStoreArea(
      { id, occupants: [] },
      boundingBox,
      broadcastEmitter,
      this._playerDatabase,
    );
    // this._tradingArea = new TradingArea(
    //   { tradingBoard, id, occupants: [] },
    //   testAreaBox,
    //   townEmitter,
    //   this._playerDatabase,
    // );
  }

  public get playerDatabase(): PlayerDatabase {
    return this._playerDatabase;
  }

  public get groceryStoreArea(): GroceryStoreArea {
    return this._groceryStoreArea;
  }

  public get tradingArea(): TradingArea {
    return this._tradingArea;
  }
}
