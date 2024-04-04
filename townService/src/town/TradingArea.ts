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
      this._postTradingOffer(player.id, player.userName, command.item, command.quantity, command.itemDesire, command.quantityDesire);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'AcceptTradingOffer') {
      console.log('Accept Offer');
      this._acceptTradingOffer(player.id, command.playerID, command.item, command.quantity, command.itemDesire, command.quantityDesire);
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

  private async _modifyAcceptingPlayerInventory(playerID: string, item: string, quantity: number, itemDesire: string, quantityDesire: number): Promise<void> {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('playerInventory')
      .select('itemList')
      .eq('playerID', playerID);
    
    if (inventoryError) {
      throw new Error('Error fetching current player inventory');
    }

    let inventoryList: { name: any; price: any; quantity: any }[] = [];
    if (inventoryData && inventoryData.length > 0) {
      inventoryList = JSON.parse(inventoryData[0].itemList);
    }

    let addItem = inventoryList.find((i: any) => i.name === item);
    console.log("add item ", item)
    let removeItem = inventoryList.find((i: any) => i.name === itemDesire);
    if (removeItem) {
      removeItem.quantity -= quantityDesire;
    }

    if (addItem) {
      addItem.quantity += quantity;
    } else {
      inventoryList.push({ name: item, price: 10, quantity: quantity });
    }

    await supabase.from('playerInventory').upsert([
      { playerID: playerID, itemList: JSON.stringify(inventoryList), balance: 100 },
    ]);
  }

  private async _acceptTradingOffer(
    playerID: string,
    offerId: string,
    item: string,
    quantity: number,
    itemDesire: string,
    quantityDesire: number,
  ): Promise<void> {
    // // Fetch the current player's inventory
    // const { data: inventoryData, error: inventoryError } = await supabase
    //   .from('playerInventory')
    //   .select('itemList')
    //   .eq('playerID', playerID);
    // if (inventoryError) {
    //   throw new Error('Error fetching current player inventory');
    // }

    // let inventoryList: { name: any; price: any; quantity: any }[] = [];
    // if (inventoryData && inventoryData.length > 0) {
    //   inventoryList = JSON.parse(inventoryData[0].itemList);
    // }

    // // Update the inventory based on the trading offer
    // const existingItem = inventoryList.find((i: any) => i.name === item);
    // const existingDesireItem = inventoryList.find((i: any) => i.name === itemDesire);
    // if (existingDesireItem) {
    //   existingDesireItem.quantity -= quantityDesire;
    // }

    // if (existingItem) {
    //   existingItem.quantity += quantity;
    // } else {
    //   inventoryList.push({ name: item, price: 10 , quantity: quantity });
    // }

    // // Update the playerInventory table with the new inventory
    // await supabase.from('playerInventory').upsert([
    //   { playerID: playerID, itemList: JSON.stringify(inventoryList) },
    // ]);

    this._modifyAcceptingPlayerInventory(playerID, item, quantity, itemDesire, quantityDesire);

    // Fetch the offer maker's inventory
    const { data: offerMakerInventoryData, error: offerMakerInventoryError } = await supabase
      .from('playerInventory')
      .select('itemList')
      .eq('playerID', offerId);
    if (offerMakerInventoryError) {
      throw new Error('Error fetching offer maker inventory');
    }

    let offerMakerInventoryList: { name: any; price: any; quantity: any }[] = [];
    if (offerMakerInventoryData && offerMakerInventoryData.length > 0) {
      offerMakerInventoryList = JSON.parse(offerMakerInventoryData[0].itemList);
    }
   
    // Update the offer maker's inventory
    const offerMakerExistingDesireItem = offerMakerInventoryList.find((i: any) => i.name === itemDesire);
    if (offerMakerExistingDesireItem) {
      offerMakerExistingDesireItem.quantity += quantity;
    } else {
      offerMakerInventoryList.push({ name: itemDesire, price:10, quantity: quantityDesire });
    }

    // Update the playerInventory table with the new offer maker's inventory
    await supabase.from('playerInventory').upsert([
      { playerID: offerId, itemList: JSON.stringify(offerMakerInventoryList) },
    ]);

    await supabase
      .from('tradingBoard')
      .delete()
      .eq('playerID', offerId);

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
    // Fetch the offer maker's inventory
    const { data: offerMakerInventoryData, error: offerMakerInventoryError } = await supabase
      .from('playerInventory')
      .select('itemList')
      .eq('playerID', playerID);
    if (offerMakerInventoryError) {
      throw new Error('Error fetching offer maker inventory');
    }

    let offerMakerInventoryList: { name: any; price: any; quantity: any }[] = [];
    if (offerMakerInventoryData && offerMakerInventoryData.length > 0) {
      offerMakerInventoryList = JSON.parse(offerMakerInventoryData[0].itemList);
    }

    // Update the offer maker's inventory
    const offerMakerExistingItem = offerMakerInventoryList.find((i: any) => i.name === item);
    if (offerMakerExistingItem) {
      offerMakerExistingItem.quantity -= quantity;
    }
    // Update the playerInventory table with the new offer maker's inventory
    await supabase.from('playerInventory').upsert([
      { playerID: playerID, itemList: JSON.stringify(offerMakerInventoryList), balance:100 },
    ]);

    const { data, error } = await supabase
      .from('tradingBoard')
      .insert([{ playerID: playerID, playerName, item, quantity, itemDesire, quantityDesire: quantityDesire}]);
    console.log("trading board ",data);
    if (data) {
      this._tradingBoard = data;
      this._emitAreaChanged();
    }
    if (error) {
      throw new Error('Error posting trading offer');
    }
  }
}
