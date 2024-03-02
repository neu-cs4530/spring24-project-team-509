import Player from "../../lib/Player";
import { Interactable, InteractableCommand, InteractableCommandReturnType } from "../../types/CoveyTownSocket";
import InteractableArea from "../InteractableArea";

export default class TradingArea extends InteractableArea {
    public toModel(): Interactable {
        // Implement the logic to convert TradingArea to its corresponding model representation
        // Return the model object
        throw new Error();
    }

    public handleCommand<CommandType extends InteractableCommand>(command: CommandType, player: Player): InteractableCommandReturnType<CommandType> {
        // Implement the logic to handle different commands received by the TradingArea
        // Use the 'command' parameter to determine the type of command and perform the necessary actions
        // Use the 'player' parameter to access the player information and update the TradingArea accordingly
        // Return the result of the command execution
        // Example:
        throw new Error();
    //Design a platform to maintain Trading request and Maintain players's status
    // Implement any additional methods or properties as needed
}