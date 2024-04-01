import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import InventoryAreaController from '../../../classes/interactable/InventoryAreaController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import InventoryAreaInteractable from './InventoryArea';
import {
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
} from '@chakra-ui/react';
import { InventoryArea as InventoryAreaModel } from '../../../types/CoveyTownSocket';
import { supabase } from '../../../supabaseClient';
import React from 'react';

type playerItems = {
  name: string;
  quantity: number;
  price: number;
};

export function Inventory({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [items, setItems] = useState<playerItems[] | null>([]);
  const [dbError, setdbError] = useState<string | null>(null);

  const inventoryAreaController =
    useInteractableAreaController<InventoryAreaController>(interactableID);

  const [inventoryAreaModel, setInventoryAreaModel] = useState<InventoryAreaModel>(
    inventoryAreaController.toInteractableAreaModel(),
  );

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      setInventoryAreaModel(inventoryAreaController.toInteractableAreaModel());
    };
    inventoryAreaController.addListener('inventoryAreaUpdated', updateInventoryAreaModel);

    let isMounted = true;
    const fetchStoreInventory = async () => {
      const { data, error } = await supabase.from('playerInventory').select();
      if (isMounted) {
        if (data) {
          setItems(data[0].itemList);
          setdbError(null);
        }
        if (error) {
          setdbError(error.message);
        }
      }
    };

    fetchStoreInventory();
    return () => {
      isMounted = false;
      inventoryAreaController.removeListener('inventoryAreaUpdated', updateInventoryAreaModel);
    };
  }, []);

  return (
    <Container className='Inventory Table'>
      <Heading>Inventory</Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>Item Name</Th>
            <Th>Quantity</Th>
            <Th>Price</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items?.map((item, index) => (
            <Tr key={index}>
              <Td>{item.name}</Td>
              <Td>{item.quantity}</Td>
              <Td>{item.price}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Container>
  );
}

export default function InventoryAreaWrapper(): JSX.Element {
  const inventoryArea = useInteractable<InventoryAreaInteractable>('inventoryArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (inventoryArea) {
      townController.interactEnd(inventoryArea);
    }
  }, [townController, inventoryArea]);

  useEffect(() => {
    if (inventoryArea) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, inventoryArea]);

  if (inventoryArea) {
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
          <ModalHeader>{inventoryArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Inventory interactableID={inventoryArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
