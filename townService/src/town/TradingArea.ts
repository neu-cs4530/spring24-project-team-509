import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError, { SAME_PLAYER_TRYING_TO_TRADE } from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import InteractableArea from './InteractableArea';
import {
  BoundingBox,
  TradingArea as TradingAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  GroceryItem,
  TradingOffer,
} from '../types/CoveyTownSocket';
import { supabase } from '../../supabaseClient';

export default class TradingArea extends InteractableArea {
  protected _tradingBoard: TradingOffer[] = [];

  protected _inventory: GroceryItem[] = [];

  protected _name = '';

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
      inventory: this._inventory,
      name: this._name,
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
    return new TradingArea(
      { id: name, occupants: [], tradingBoard: [], inventory: [], name: '' },
      rect,
      broadcastEmitter,
    );
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'OpenTradingBoard') {
      this._openTradingBoard();
      this._fetchInventory(player.id);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PostTradingOffer') {
      this._postTradingOffer(
        player.id,
        player.userName,
        command.item,
        command.quantity,
        command.itemDesire,
        command.quantityDesire,
      );
      this._fetchInventory(player.id);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'AcceptTradingOffer') {
      this._acceptTradingOffer(
        player.id,
        command.playerID,
        command.item,
        command.quantity,
        command.itemDesire,
        command.quantityDesire,
      );
      this._fetchInventory(player.id);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'DeleteOffer') {
      this._deleteOffer(player.id);
      this._fetchInventory(player.id);
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

  private async _fetchInventory(playerID: string): Promise<void> {
    const { data } = await supabase.from('playerInventory').select().eq('playerID', playerID);
    let inventoryList: GroceryItem[] = [];
    if (data && data.length > 0) {
      inventoryList = JSON.parse(data[0].itemList);
    }
    this._inventory = inventoryList;
    this._name = playerID;

    this._emitAreaChanged();
  }

  private async _deleteOffer(playerID: string): Promise<void> {
    const { data: items } = await supabase.from('tradingBoard').select().eq('playerID', playerID);
    if (items && items.length > 0) {
      const item = items[0];
      this._addToOfferMakerInventory(playerID, item.item, item.quantity);
    }

    await supabase.from('tradingBoard').delete().eq('playerID', playerID);

    const { data: board } = await supabase.from('tradingBoard').select();
    if (board) {
      this._tradingBoard = board;
    }
    this._emitAreaChanged();
  }

  private async _modifyAcceptingPlayerInventory(
    playerID: string,
    item: string,
    quantity: number,
    itemDesire: string,
    quantityDesire: number,
  ): Promise<void> {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('playerInventory')
      .select('itemList')
      .eq('playerID', playerID);

    if (inventoryError) {
      throw new Error('Error fetching current player inventory');
    }

    let inventoryList: { name: string; price: number; quantity: number }[] = [];
    if (inventoryData && inventoryData.length > 0) {
      inventoryList = JSON.parse(inventoryData[0].itemList);
    }

    const addItem = inventoryList.find((i: GroceryItem) => i.name === item);
    const itemIndex = inventoryList.findIndex(i => i.name === itemDesire);

    if (inventoryList[itemIndex].quantity === quantityDesire) {
      inventoryList.splice(itemIndex, 1);
    } else {
      inventoryList[itemIndex].quantity -= quantityDesire;
    }

    const { data: itemPrice } = await supabase
      .from('StoreInventory')
      .select('price')
      .eq('name', item);

    const itemPricee = itemPrice ? itemPrice[0].price : 0;

    if (addItem) {
      addItem.quantity += quantity;
    } else {
      inventoryList.push({ name: item, price: itemPricee, quantity });
    }

    let balance = 100;
    for (const procItem of inventoryList) {
      balance -= procItem.price * procItem.quantity;
    }

    await supabase
      .from('playerInventory')
      .upsert([{ playerID, itemList: JSON.stringify(inventoryList), balance }]);
  }

  private async _removeFromOfferMakerInventory(
    playerID: string,
    item: string,
    quantity: number,
  ): Promise<void> {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('playerInventory')
      .select('itemList')
      .eq('playerID', playerID);

    if (inventoryError) {
      throw new Error('Error fetching current player inventory');
    }

    let inventoryList: { name: string; price: number; quantity: number }[] = [];
    if (inventoryData && inventoryData.length > 0) {
      inventoryList = JSON.parse(inventoryData[0].itemList);
    }

    const itemIndex = inventoryList.findIndex(i => i.name === item);
    if (itemIndex === -1 || inventoryList[itemIndex].quantity < quantity) {
      throw new InvalidParametersError(
        'Item not found in inventory or quantity is less than requested',
      );
    }

    if (inventoryList[itemIndex].quantity === quantity) {
      inventoryList.splice(itemIndex, 1);
    } else {
      inventoryList[itemIndex].quantity -= quantity;
    }

    let balance = 100;
    for (const procItem of inventoryList) {
      balance -= procItem.price * procItem.quantity;
    }

    await supabase
      .from('playerInventory')
      .upsert([{ playerID, itemList: JSON.stringify(inventoryList), balance }]);
  }

  private async _addToOfferMakerInventory(
    playerID: string,
    item: string,
    quantity: number,
  ): Promise<void> {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('playerInventory')
      .select('itemList')
      .eq('playerID', playerID);

    if (inventoryError) {
      throw new Error('Error fetching current player inventory');
    }

    let inventoryList: GroceryItem[] = [];
    if (inventoryData && inventoryData.length > 0) {
      inventoryList = JSON.parse(inventoryData[0].itemList);
    }

    const { data: itemPrice } = await supabase
      .from('StoreInventory')
      .select('price')
      .eq('name', item);

    const itemPricee = itemPrice ? itemPrice[0].price : 0;

    const addItem = inventoryList.find((i: GroceryItem) => i.name === item);
    if (addItem) {
      addItem.quantity += quantity;
    } else {
      inventoryList.push({ name: item, price: itemPricee, quantity });
    }

    let balance = 100;
    for (const procItem of inventoryList) {
      balance -= procItem.price * procItem.quantity;
    }

    await supabase
      .from('playerInventory')
      .upsert([{ playerID, itemList: JSON.stringify(inventoryList), balance }]);
  }

  private async _acceptTradingOffer(
    playerID: string,
    offerId: string,
    item: string,
    quantity: number,
    itemDesire: string,
    quantityDesire: number,
  ): Promise<void> {
    if (playerID === offerId) {
      throw new InvalidParametersError(SAME_PLAYER_TRYING_TO_TRADE);
    }

    this._modifyAcceptingPlayerInventory(playerID, item, quantity, itemDesire, quantityDesire);

    this._addToOfferMakerInventory(offerId, itemDesire, quantityDesire);

    await supabase.from('tradingBoard').delete().eq('playerID', offerId);

    const { data: updatedTradingBoardData, error: fetchError } = await supabase
      .from('tradingBoard')
      .select();
    if (updatedTradingBoardData) {
      this._tradingBoard = updatedTradingBoardData;
      this._emitAreaChanged();
    }
    if (fetchError) {
      throw new Error('Error fetching updated trading board data');
    }
  }

  private async _postTradingOffer(
    playerID: string,
    playerName: string,
    item: string,
    quantity: number,
    itemDesire: string,
    quantityDesire: number,
  ): Promise<void> {
    this._removeFromOfferMakerInventory(playerID, item, quantity);

    await supabase.from('tradingBoard').insert([
      {
        playerID,
        playerName,
        item,
        quantity,
        itemDesire,
        quantityDesire,
      },
    ]);
    const { data, error } = await supabase.from('tradingBoard').select();
    if (data) {
      this._tradingBoard = data;
      this._emitAreaChanged();
    }
    if (error) {
      throw new InvalidParametersError('Error posting trading offer');
    }
  }
}
