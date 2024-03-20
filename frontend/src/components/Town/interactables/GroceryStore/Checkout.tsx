import { Button, chakra, Container, Table, TableCaption, TableContainer, Td, Tbody, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GroceryStoreArea from "./GroceryStoreArea";

export type GroceryStoreProps = {
    groceryAreaController: GroceryStoreAreaController;
};
const CheckOutList = chakra(Container, {
    baseStyle: {
        display: 'flex',
        width: '400px',
        height: '400px',
        padding: '5px',
        flexWrap: 'wrap',
    }
});

export default function Checkout({
    groceryAreaController,
}: GroceryStoreProps): JSX.Element {
    const [cartItems, setCartItems] = useState(groceryAreaController.groceryCart);
    const [checkoutStatus, setCheckoutStatus] = useState(groceryAreaController.checkoutStatus);
    
    useEffect(() => {
        const updateGroceryState = () => {
            setCartItems(groceryAreaController.groceryCart);
            setCheckoutStatus(groceryAreaController.checkoutStatus);
        };

        groceryAreaController.addListener('groceryUpdated', updateGroceryState);

        return () => {
            groceryAreaController.removeListener('groceryUpdated', updateGroceryState);
        };
    }, [groceryAreaController]);
    return (
        <CheckOutList aria-label='Player Checkout Menu'>
            
                <TableContainer>
                    <Table variant='striped' colorScheme='teal'>
                        <TableCaption>Checkout</TableCaption> 
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
                            {cartItems.map((item) => (
                            <Tr>
                                <Td>{item.name}</Td>
                                <Td>{item.price}</Td>
                                <Td>{item.quantity}</Td>
                            </Tr>)}
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
        </CheckOutList>
    );
}
//+ - the items and then change the total
// checkout button
//maybe also show player name/id