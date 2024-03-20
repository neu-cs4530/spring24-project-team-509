import { Button, chakra, Container, Table, TableCaption, TableContainer, Td, Tbody, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GroceryStoreArea from "./GroceryStoreArea";

export type GroceryStoreProps = {
    groceryAreaController: GroceryStoreAreaController;
};
const GroceryStoreInventory = chakra(Container, {
    baseStyle: {
        display: 'flex',
        width: '400px',
        height: '400px',
        padding: '5px',
        flexWrap: 'wrap',
    }
});

export default function Inventory({
    groceryAreaController,
}: GroceryStoreProps): JSX.Element {
    const [groceryItems, setGroceryItems] = useState(groceryAreaController.groceryItems);
    const [playerCart, setPlayerCart] = useState(groceryAreaController.playerCart);
    
    useEffect(() => {
        const updateGroceryState = () => {
            setGroceryItems(groceryAreaController.groceryItems);
            setPlayerCart(groceryAreaController.playerCart);
        };

        groceryAreaController.addListener('groceryUpdated', updateGroceryState);

        return () => {
            groceryAreaController.removeListener('groceryUpdated', updateGroceryState);
        };
    }, [groceryAreaController]);
    return (
        <GroceryStoreInventory aria-label='Grocery Store Inventory'>
            <TableContainer>
                    <Table variant='striped' colorScheme='teal'>
                        <TableCaption>Grocery Store Inventory</TableCaption> 
                        {/* table headers */}
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Price</Th>
                                <Th>Quantity</Th>
                            </Tr>
                        </Thead>
                        {/* items */}
                        <Tbody>
                            {groceryItems.map((item) => (
                
                            <Tr>
                                <Td>{item.name}</Td>
                                <Td>{item.price}</Td>
                                <Td>{item.quantity}</Td>
                            </Tr>)};
                        </Tbody>
                        {/* total of the checkout items */}
                        <Tfoot>
                            <Tr>
                                <Th>Total</Th>
                                <Th>{cartItems.reduce((item) => item.price * item.quantity, 0)}</Th>
                            </Tr>
                        </Tfoot>
                    </Table> 
                </TableContainer> 
            )
        </GroceryStoreInventory>
    );
}

