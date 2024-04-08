import { InventoryArea as InventoryAreaModel, GroceryItem } from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  INVENTORY_AREA_TYPE,
} from './InteractableAreaController';
import TownController from '../TownController';

export type InventoryAreaEvents = BaseInteractableEventMap & {
  inventoryAreaUpdated: () => void;
};

export default class InventoryAreaController extends InteractableAreaController<
  InventoryAreaEvents,
  InventoryAreaModel
> {
  protected _townController: TownController;

  protected _playerInventory: GroceryItem[] = [];

  constructor(id: string, townController: TownController) {
    super(id);
    this._townController = townController;
    this._playerInventory = [];
  }

  toInteractableAreaModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'InventoryArea',
      playerInventory: this._playerInventory,
    };
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  get type(): string {
    return INVENTORY_AREA_TYPE;
  }

  get friendlyName(): string {
    return this.id;
  }

  get playerInventory(): GroceryItem[] {
    return this._playerInventory;
  }

  /**
   * Update the inventory area with the updated model.
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: InventoryAreaModel): void {
    this._playerInventory = updatedModel.playerInventory;
    console.log('invencontrol updates', this._playerInventory);
    this.emit('inventoryAreaUpdated');
  }

  /**
   * To open the grocery store.
   * To initialize the store inventory and cart.
   */
  public async handleOpenInventory(): Promise<void> {
    console.log('controller opens');
    await this._townController.sendInteractableCommand(this.id, {
      type: 'OpenInventory',
    });
  }
}
