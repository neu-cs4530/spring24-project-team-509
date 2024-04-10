import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import Interactable, { KnownInteractableTypes } from '../Interactable';

/**
 * Represents a Trading Area interactable in the game.
 */
export default class TradingArea extends Interactable {
  private _isInteracting = false;

  private _infoTextBox?: Phaser.GameObjects.Text;

  private _tradingArea?: TradingAreaController;

  /**
   * Gets the type of the interactable.
   * @returns The type of the interactable.
   */
  getType(): KnownInteractableTypes {
    return 'tradingArea';
  }

  /**
   * Called when the TradingArea is added to the scene.
   */
  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._tradingArea = this.townController.getTradingAreaController(this);
  }

  /**
   * Called when the TradingArea overlaps with the player's exit area.
   */
  overlapExit(): void {
    // No action needed
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
    this._infoTextBox?.setVisible(false);
  }

  /**
   * Called when the player interacts with the TradingArea.
   */
  interact(): void {
    // No action needed
    this._isInteracting = true;
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          "You've found the Trading Area!.",
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  /**
   * Called when the TradingArea overlaps with the player.
   */
  overlap(): void {
    this._showInfoBox();
  }
}
