import { use } from "matter";
import { useInteractableAreaController } from "../../../../classes/TownController";
import useTownController from "../../../../hooks/useTownController";
import { InteractableID } from "../../../../types/CoveyTownSocket";
import { GroceryController } from "../../../classes/interactable/GroceryController";
import { set } from "lodash";
import { useState, useEffect } from "react";
import { chakra, Container } from "@chakra-ui/react";

const StyledGroceryStoreArea = chakra(Container, {
    baseStyle: {
        display: 'flex',
        width: '400px',
        height: '400px',
        padding: '5px',
        flexWrap: 'wrap',
    }
})

export default function GroceryStoreArea({
    interactableID,
}): {
    interactableID: InteractableID;
}): JSX.Element {
    //TODO: controller
    const groceryAreaController = useInteractableAreaController<GroceryController>(interactableID);
    const townController = useTownController();
    
    //TODO: controller
    const [playerDatabase, setPlayerDatabase] = useState<PlayerDatabase | undefined>(groceryAreaController.playerDatabase);
    
    //checkout items
    const [checkoutItems, setCheckoutItems] = useState(groceryAreaController.checkoutItems);
    //checkout status - changes when 
    const [checkoutStatus, setCheckoutStatus] = useState(groceryAreaController.checkoutStatus);
    //menu items - only change when checkout completes
    const [menuItems, setMenuItems] = useState(groceryAreaController.groceryInventory);

    useEffect(() => {
        const updateGroceryState = () => {
            setPlayerDatabase(groceryAreaController.playerDatabase);
            setCheckoutItems(groceryAreaController.checkoutItems);
            setCheckoutStatus(groceryAreaController.checkoutStatus);
            setMenuItems(groceryAreaController.groceryInventory);
        };

        const updateGameState = () => {
            
        }
        groceryAreaController.addListener('groceryUpdated', updateGroceryState);

        //
        
        return () => {
            groceryAreaController.removeListener('groceryUpdated', updateGroceryState);
        };
    }, [townController, groceryAreaController]);

    return (
        <StyledGroceryStoreArea>
            {menuItems.map((item) => (
                <GroceryItem
                    key={item.id}
                    item={item}
                    onAddToCart={() => groceryAreaController.addToCart(item.id)}
                />
            ))}
        </StyledGroceryStoreArea>
    )
}