import InventoryAreaController from '../../../classes/interactable/InventoryAreaController';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class InventoryArea extends Interactable {
  private _isInteracting = false;

  private _infoTextBox?: Phaser.GameObjects.Text;

  private _inventoryArea?: InventoryAreaController;

  getType(): KnownInteractableTypes {
    return 'inventoryArea';
  }

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
    this._inventoryArea = this.townController.getInventoryAreaController(this);
    //console.log(this.townController.nearbyPlayers)
  }

  overlapExit(): void {
    // No action needed
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
    this._infoTextBox?.setVisible(false);
  }

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
          'Press space to view your inventory',
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    this._showInfoBox();
  }
}
