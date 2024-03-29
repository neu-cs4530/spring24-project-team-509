import GroceryStoreAreaController from '../../../classes/interactable/GroceryStoreAreaController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { GroceryStoreArea as GroceryStoreAreaModel } from '../../../types/CoveyTownSocket';
import GroceryStoreAreaInteractable from './GroceryStoreArea';
import useTownController from '../../../hooks/useTownController';
import { supabase } from '../../../supabaseClient';
import React from 'react';

export function GroceryMenu({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const groceryStoreAreaController =
    useInteractableAreaController<GroceryStoreAreaController>(interactableID);

  const [storeInventory, setStoreInventory] = useState<any[] | null>([]);
  const [dbError, setdbError] = useState<string | null>(null);
  const [storeCart, setStoreCart] = useState<any[] | null>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const [groceryStoreAreaModel, setGroceryStoreAreaModel] = useState<GroceryStoreAreaModel>(
    groceryStoreAreaController.toInteractableAreaModel(),
  );

  const handleCalculateTotalPrice = () => {
    const total = groceryStoreAreaController.totalPrice;
    setTotalPrice(total);
  };

  const handleRemoveItem = async (itemName: string) => {
    groceryStoreAreaController.handleRemoveItem(itemName);
  };

  const handleAddItem = async (itemName: string, price: number) => {
    groceryStoreAreaController.handleAddItem(itemName, price);
  };

  let isMounted = true;
  // const fetchStoreInventory = async () => {
  //   const { data, error } = await supabase.from('StoreInventory').select();
  //   if (isMounted) {
  //     if (data) {
  //       setStoreInventory(data);
  //       setdbError(null);
  //     }
  //     if (error) {
  //       setdbError(error.message);
  //       console.error('Error fetching store cart:', error.message);
  //       setStoreInventory(null);
  //     }
  //   }
  // };
  const fetchStoreInventory = () => {
    const data = groceryStoreAreaController.storeInventory;
    if (isMounted) {
      if (data) {
        setStoreInventory(data);
        setdbError(null);
      }
    }
  };

  const fetchCart = async () => {
    const { data, error } = await supabase.from('storeCart').select();
    if (isMounted) {
      if (data) {
        setStoreCart(data);
        setdbError(null);
      }
      if (error) {
        setdbError(error.message);
        console.error('Error fetching store cart:', error.message);
        setStoreCart(null);
      }
    }
  };

  useEffect(() => {
    const updateGroceryStoreAreaModel = () => {
      setGroceryStoreAreaModel(groceryStoreAreaController.toInteractableAreaModel());
    };
    groceryStoreAreaController.addListener('groceryStoreAreaUpdated', updateGroceryStoreAreaModel);

    fetchStoreInventory();
    fetchCart();
    handleCalculateTotalPrice();

    return () => {
      isMounted = false;
      groceryStoreAreaController.removeListener(
        'groceryStoreAreaUpdated',
        updateGroceryStoreAreaModel,
      );
    };
  }, [groceryStoreAreaController, storeInventory, dbError, storeCart, totalPrice]);

  // sort((a, b) => a.name.localeCompare(b.name)) for sorting items but it makes everything slow down
  // so I commented it out
  return (
    <div className='GroceryStoreMenu'>
      {dbError && <p>{dbError}</p>}
      {storeInventory && (
        <div>
          <Heading as='h3'>GroceryStore</Heading>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {storeInventory
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item: any) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <Button onClick={() => handleAddItem(item.name, item.price)}>Add</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {storeCart && (
        <div>
          <Heading as='h3'>Cart</Heading>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {storeCart
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item: any) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <Button onClick={() => handleRemoveItem(item.name)}>Return</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <p>Total Price: {totalPrice}</p>
      <Button>Checkout</Button>
    </div>
  );
}

export default function GroceryStoreAreaWrapper(): JSX.Element {
  const groceryStoreArea = useInteractable<GroceryStoreAreaInteractable>('groceryStoreArea');
  const townController = useTownController();
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
