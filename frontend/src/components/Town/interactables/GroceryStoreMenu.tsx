import GroceryStoreAreaController from '../../../classes/interactable/GroceryStoreAreaController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { GroceryStoreArea as GroceryStoreAreaModel } from '../../../types/CoveyTownSocket';
import GroceryStoreAreaInteractable from './GroceryStoreArea';
import useTownController from '../../../hooks/useTownController';
import { supabase } from '../../../supabaseClient';
import React from 'react';
import { Icon } from '@chakra-ui/react'
import { set } from 'lodash';

export function GroceryMenu({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const groceryStoreAreaController =
    useInteractableAreaController<GroceryStoreAreaController>(interactableID);

  const [storeInventory, setStoreInventory] = useState<any[] | null>(groceryStoreAreaController.storeInventory);
  const [dbError, setdbError] = useState<string | null>(null);
  const [storeCart, setStoreCart] = useState<any[] | null>(groceryStoreAreaController.cart);
  const [totalPrice, setTotalPrice] = useState<number>(groceryStoreAreaController.totalPrice);
  const toast = useToast();

  const [groceryStoreAreaModel, setGroceryStoreAreaModel] = useState<GroceryStoreAreaModel>(
    groceryStoreAreaController.toInteractableAreaModel(),
  );

  const handleRemoveItem = async (itemName: string) => {
    await groceryStoreAreaController.handleRemoveItem(itemName);
  };

  const handleAddItem = async (itemName: string, price: number) => {
    await groceryStoreAreaController.handleAddItem(itemName, price);
  };

  const handleCheckout2 = async () => {
    await groceryStoreAreaController.handleCheckout();
  };

  const fetchStore = () => {
    setStoreInventory(groceryStoreAreaController.storeInventory);
    setStoreCart(groceryStoreAreaController.cart); 
    setTotalPrice(groceryStoreAreaController.totalPrice);
  }

  const handleCheckout = async () => {
    const { data: cartData, error: cartError } = await supabase.from('storeCart').select();
    if (cartData && cartData.length > 0) {
      const itemList = cartData.map((item: any) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      await supabase.from('playerInventory').upsert([
        {
          playerID: 5,
          itemList: JSON.stringify(itemList),
          balance: 100,
        },
      ]);
      await supabase.from('storeCart').delete();
      setStoreCart([]);
      setTotalPrice(0);
    }
  };

  useEffect(() => {
    const updateGroceryStoreAreaModel = () => {
      setGroceryStoreAreaModel(groceryStoreAreaController.toInteractableAreaModel());
      fetchStore();
      console.log(storeCart, totalPrice, storeInventory);
    };
    groceryStoreAreaController.addListener('groceryStoreAreaUpdated', updateGroceryStoreAreaModel);
    fetchStore();
    return () => {
      groceryStoreAreaController.removeListener(
        'groceryStoreAreaUpdated',
        updateGroceryStoreAreaModel,
      );
    };
  }, [groceryStoreAreaController, dbError, groceryStoreAreaController, storeCart, totalPrice, storeInventory]);
  //groceryStoreAreaController.handleOpenGroceryStore();
  
  return (
    <Container className='GroceryStoreMenu'>
      {dbError && <p>{dbError}</p>}
      {storeInventory && (
        <Container>
          <Heading as='h3'>GroceryStore</Heading>
          <Table>
            <Thead>
              <Tr>
                <Th>Item Name</Th>
                <Th>Price</Th>
                <Th>Quantity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {storeInventory
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item: any) => (
                  <Tr key={item.name}>
                    <Td>{item.name}</Td>
                    <Td>{item.price}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>
                      <Button onClick={async () => {
                        try {
                          await handleAddItem(item.name, item.price);
                        } catch (err) {
                          toast({
                            title: 'Error adding item',
                            description: (err as Error).toString(),
                            status: 'error',
                          });
                        }
                      }}
                      >Add</Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>
      )}
      {storeCart && (
        <Container>
          <Heading as='h3'>Cart</Heading>
          <Table>
            <Thead>
              <Tr>
                <Th>Item Name</Th>
                <Th>Price</Th>
                <Th>Quantity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {storeCart
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item: any) => (
                  <Tr key={item.name}>
                    <Td>{item.name}</Td>
                    <Td>{item.price}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>
                      <Button onClick={() => handleRemoveItem(item.name)}>Return</Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>
      )}
      <p>Total Price: {totalPrice}</p>
      <Button onClick={() => handleCheckout2()}>Checkout</Button>
    </Container>
  );
}

export default function GroceryStoreAreaWrapper(): JSX.Element {
  const groceryStoreArea = useInteractable<GroceryStoreAreaInteractable>('groceryStoreArea');
  const townController = useTownController();
  let controller;
  if (groceryStoreArea) {
    controller = townController.getGroceryStoreAreaController(groceryStoreArea);
  }
  const closeModal = useCallback(() => {
    if (groceryStoreArea) {
      townController.interactEnd(groceryStoreArea);
    }
  }, [townController, groceryStoreArea]);

  useEffect(() => {
    if (groceryStoreArea) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, groceryStoreArea]);

  if (groceryStoreArea) {
    controller?.handleOpenGroceryStore();
    return (
      <Modal
        isOpen={true}
        onClose={() => {
          closeModal();
          townController.unPause();
        }}
        closeOnOverlayClick={false}
        size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{groceryStoreArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <GroceryMenu interactableID={groceryStoreArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
