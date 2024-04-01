import GroceryStoreAreaController from '../../../classes/interactable/GroceryStoreAreaController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { GroceryStoreArea as GroceryStoreAreaModel } from '../../../types/CoveyTownSocket';
import GroceryStoreAreaInteractable from './GroceryStoreArea';
import useTownController from '../../../hooks/useTownController';
import { supabase } from '../../../supabaseClient';
import React from 'react';
import {
  FaPepperHot,
  FaLemon,
  FaIceCream,
  FaHotdog,
  FaHamburger,
  FaFish,
  FaEgg,
  FaCookie,
  FaCheese,
  FaCarrot,
  FaCandyCane,
  FaBreadSlice,
  FaBacon,
  FaAppleAlt,
  FaQuestionCircle,
  FaPizzaSlice,
} from 'react-icons/fa';

export function GroceryMenu({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const iconMap = {
    'pizza-slice': FaPizzaSlice,
    'hot-pepper': FaPepperHot,
    'lemon': FaLemon,
    'ice-cream': FaIceCream,
    'hotdog': FaHotdog,
    'hamburger': FaHamburger,
    'fish': FaFish,
    'egg': FaEgg,
    'cookie': FaCookie,
    'cheese': FaCheese,
    'carrot': FaCarrot,
    'candy-cane': FaCandyCane,
    'bread-slice': FaBreadSlice,
    'bacon': FaBacon,
    'apple': FaAppleAlt,
    'question-circle': FaQuestionCircle,
  };

  const groceryStoreAreaController =
    useInteractableAreaController<GroceryStoreAreaController>(interactableID);

  const [storeInventory, setStoreInventory] = useState<any[] | null>([]);
  const [dbError, setdbError] = useState<string | null>(null);
  const [storeCart, setStoreCart] = useState<any[] | null>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const toast = useToast();

  const [groceryStoreAreaModel, setGroceryStoreAreaModel] = useState<GroceryStoreAreaModel>(
    groceryStoreAreaController.toInteractableAreaModel(),
  );

  const handleCalculateTotalPrice = async () => {
    const { data } = await supabase.from('storeCart').select();
    let total = 0;
    if (data) {
      data.forEach((item: any) => {
        total += item.price * item.quantity;
      });
    }
    setTotalPrice(total);
  };

  const handleReduceItemFromCart = async (itemName: string) => {
    const { data } = await supabase.from('storeCart').select().eq('name', itemName);
    if (data && data.length > 0) {
      const item = data[0];
      if (item.quantity > 0) {
        await supabase
          .from('storeCart')
          .update({ quantity: item.quantity - 1 })
          .eq('name', itemName);
        if (item.quantity === 1) {
          await supabase.from('storeCart').delete().eq('name', itemName);
        }
      } else {
        await supabase.from('storeCart').delete().eq('name', itemName);
      }
    }
  };

  const handleAddItemToInventory = async (itemName: string) => {
    const { data } = await supabase.from('StoreInventory').select().eq('name', itemName);
    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('StoreInventory')
        .update({ quantity: item.quantity + 1 })
        .eq('name', itemName);
    }
  };

  //This stays here, move the content function to controller
  const handleReturnItem = async (itemName: string) => {
    //groceryStoreAreaController
    handleReduceItemFromCart(itemName);
    handleAddItemToInventory(itemName);
    handleCalculateTotalPrice();
  };

  const handleRemoveItemFromInventory = async (itemName: string) => {
    const { data } = await supabase.from('StoreInventory').select().eq('name', itemName);

    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('StoreInventory')
        .update({ quantity: item.quantity - 1 })
        .eq('name', itemName);
      console.log(item.quantity);
    }
  };

  const handleAddItemToCart = async (itemName: string, price: number) => {
    const { data } = await supabase.from('storeCart').select().eq('name', itemName);
    if (data && data.length > 0) {
      const item = data[0];
      await supabase
        .from('storeCart')
        .upsert([{ name: item.name, price: item.price, quantity: item.quantity + 1 }]);
    } else {
      await supabase.from('storeCart').upsert([{ name: itemName, price: price, quantity: 1 }]);
    }
  };

  const handleAddItem = async (itemName: string, price: number) => {
    handleAddItemToCart(itemName, price);
    handleRemoveItemFromInventory(itemName);
    handleCalculateTotalPrice();
  };

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
    };
    groceryStoreAreaController.addListener('groceryStoreAreaUpdated', updateGroceryStoreAreaModel);

    let isMounted = true;
    const fetchStoreInventory = async () => {
      const { data, error } = await supabase.from('StoreInventory').select();
      if (isMounted) {
        if (data) {
          setStoreInventory(data);
          setdbError(null);
        }
        if (error) {
          setdbError(error.message);
          console.error('Error fetching store cart:', error.message);
          setStoreInventory(null);
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
    fetchStoreInventory();
    fetchCart();

    return () => {
      isMounted = false;
      groceryStoreAreaController.removeListener(
        'groceryStoreAreaUpdated',
        updateGroceryStoreAreaModel,
      );
    };
  }, [groceryStoreAreaController, storeInventory, dbError, storeCart]);

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
                    <td>
                      <Icon as={iconMap[item.name] || FaQuestionCircle} />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <Button onClick={() => handleReturnItem(item.name)}>Return</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <p>Total Price: {totalPrice}</p>
      <Button onClick={() => handleCheckout()}>Checkout</Button>
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
