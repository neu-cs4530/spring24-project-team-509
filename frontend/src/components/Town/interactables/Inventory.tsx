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
import React from 'react';

type PlayerItems = {
  name: string;
  quantity: number;
  price: number;
};

export function Inventory({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const inventoryAreaController =
    useInteractableAreaController<InventoryAreaController>(interactableID);
  const [items, setItems] = useState<PlayerItems[] | null>([]);
  const [dbError, setdbError] = useState<string | null>(null);
  const [playerInventory, setPlayerInventory] = useState<null[] | null>(
    inventoryAreaController.playerInventory,
  );

  const [inventoryAreaModel, setInventoryAreaModel] = useState<InventoryAreaModel>(
    inventoryAreaController.toInteractableAreaModel(),
  );

  const fetchInventory = async () => {
    //await inventoryAreaController.handleOpenInventory();
    setPlayerInventory(inventoryAreaController.playerInventory);
  };

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      fetchInventory();
      console.log('inventoryArea', playerInventory);
    };
    inventoryAreaController.addListener('inventoryAreaUpdated', updateInventoryAreaModel);
    fetchInventory();
    inventoryAreaController.handleOpenInventory();
    return () => {
      inventoryAreaController.removeListener('iventoryAreaUpdated', updateInventoryAreaModel);
    };
  }, [inventoryAreaController, playerInventory]);

  return (
    <Container className='Inventory Table'>
      <Heading>Inventory</Heading>
      {playerInventory && (
        <Table>
          <Thead>
            <Tr>
              <Th>Item Name</Th>
              <Th>Price</Th>
              <Th>Quantity</Th>
            </Tr>
          </Thead>
          <Tbody>
            {playerInventory.map((item: any) => (
              <Tr key={item.name}>
                <Td>{item.name}</Td>
                <Td>{item.price}</Td>
                <Td>{item.quantity}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Container>
  );
}

export default function InventoryAreaWrapper(): JSX.Element {
  const inventoryArea = useInteractable<InventoryAreaInteractable>('inventoryArea');
  const townController = useTownController();
  let controller;
  if (inventoryArea) {
    controller = townController.getInventoryAreaController(inventoryArea);
  }
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
    controller?.handleOpenInventory();
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
