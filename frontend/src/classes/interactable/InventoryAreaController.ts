import { useEffect, useState } from 'react';
import { InventoryArea as InventoryAreaModel } from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  INVENTORY_AREA_TYPE,
} from './InteractableAreaController';
import { supabase } from '../../supabaseClient';

export type InventoryAreaEvents = BaseInteractableEventMap & {
  inventoryAreaUpdated: () => void;
};

export default class InventoryAreaController extends InteractableAreaController<
    InventoryAreaEvents,
    InventoryAreaModel
> {
  toInteractableAreaModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'InventoryArea',
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

  protected _updateFrom(updatedModel: InventoryAreaModel): void {
    // No updates to make
    this.emit('inventoryAreaUpdated');
  }
}
