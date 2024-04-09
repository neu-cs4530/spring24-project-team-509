import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import InventoryAreaController from '../../../classes/interactable/InventoryAreaController';
import { GroceryItem, InteractableID } from '../../../types/CoveyTownSocket';
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
import React from 'react';
import AppleIcon from './icons/AppleIcon';
import BaconIcon from './icons/BaconIcon';
import BananaIcon from './icons/BananaIcon';
import BreadIcon from './icons/BreadIcon';
import CarrotIcon from './icons/CarrotIcon';
import DonutIcon from './icons/DonutIcon';
import EggIcon from './icons/EggIcon';
import FishIcon from './icons/FishIcon';
import PizzaIcon from './icons/PizzaIcon';
import NoIcon from './icons/NoIcon';

/**
 * Renders the inventory component
 * @param {Object} props - The component props
 * @param {string} props.interactableID - The ID of the interactable
 * @returns {JSX.Element} The rendered inventory component
 */
export function Inventory({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const iconMap: { [key: string]: React.ComponentType } = {
    apple: AppleIcon,
    bacon: BaconIcon,
    banana: BananaIcon,
    pizza: PizzaIcon,
    bread: BreadIcon,
    carrot: CarrotIcon,
    donut: DonutIcon,
    fish: FishIcon,
    egg: EggIcon,
  };

  const inventoryAreaController =
    useInteractableAreaController<InventoryAreaController>(interactableID);
  const [playerInventory, setPlayerInventory] = useState<GroceryItem[] | null>(
    inventoryAreaController.playerInventory,
  );

  /**
   * Fetches the player's inventory
   */
  const fetchInventory = async () => {
    //await inventoryAreaController.handleOpenInventory();
    setPlayerInventory(inventoryAreaController.playerInventory);
  };

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      setPlayerInventory(inventoryAreaController.playerInventory);
      console.log('inventoryArea', playerInventory);
    };
    inventoryAreaController.addListener('inventoryAreaUpdated', updateInventoryAreaModel);
    return () => {
      inventoryAreaController.removeListener('inventoryAreaUpdated', updateInventoryAreaModel);
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
              <Th></Th>
              <Th>Price</Th>
              <Th>Quantity</Th>
            </Tr>
          </Thead>
          <Tbody>
            {playerInventory.map((item: GroceryItem) => (
              <Tr key={item.name}>
                <Td>{item.name}</Td>
                <Td>{iconMap[item.name] ? React.createElement(iconMap[item.name]) : <NoIcon />}</Td>
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
