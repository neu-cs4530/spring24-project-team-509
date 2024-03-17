import { BoundingBox, TownEmitter } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import PlayerDatabase from './database/PlayerDatabase';

/**
 * CommercialArea is an InteractableArea on the map that can host a commercial area.
 * The commercial area stores a reference of the player database.
 *
 * isActive() is a method that checks if the commercial area is active.
 */
export default abstract class CommercialArea extends InteractableArea {
  protected _playerDatabase: PlayerDatabase;

  constructor(
    id: string,
    { x, y, width, height }: BoundingBox,
    townEmitter: TownEmitter,
    playerDatabase?: PlayerDatabase,
  ) {
    // Calls the constructor of the parent class.
    super(id, { x, y, width, height }, townEmitter);

    // Sets the playerDatabase.
    if (playerDatabase) {
      this._playerDatabase = playerDatabase;
    } else {
      this._playerDatabase = new PlayerDatabase();
    }
  }

  /**
   * If the grocery store is active.
   */
  public get isActive(): boolean {
    return true;
  }
}
