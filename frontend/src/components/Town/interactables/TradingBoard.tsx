import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import { InteractableID, TradingOffer, GroceryItem } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import TradingAreaInteractable from './TradingArea';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  Input,
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
import React from 'react';
import { InputLabel } from '@material-ui/core';
import DonutIcon from './icons/DonutIcon';
import AppleIcon from './icons/AppleIcon';
import BaconIcon from './icons/BaconIcon';
import BananaIcon from './icons/BananaIcon';
import BreadIcon from './icons/BreadIcon';
import CarrotIcon from './icons/CarrotIcon';
import EggIcon from './icons/EggIcon';
import FishIcon from './icons/FishIcon';
import PizzaIcon from './icons/PizzaIcon';
import NoIcon from './icons/NoIcon';

export function TradingBoard({ interactableID }: { interactableID: InteractableID }): JSX.Element {
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

  const [tradingBoard, setTradingBoard] = useState<TradingOffer[] | null>([]);
  const [postItem, setPostItem] = useState<string>('');
  const [postQuantity, setPostQuantity] = useState<number>(0);
  const [desireItem, setDesiteItem] = useState<string>('');
  const [desireQuantity, setDesireQuantity] = useState<number>(0);
  const [playerInventory, setPlayerInventory] = useState<GroceryItem[] | null>([]);

  const toast = useToast();

  const tradingAreaController =
    useInteractableAreaController<TradingAreaController>(interactableID);

  const handlePostItem = async (
    item: string,
    quantity: number,
    wantedItem: string,
    wantedQuantity: number,
  ) => {
    await tradingAreaController.handlePostTradingOffer(item, quantity, wantedItem, wantedQuantity);
    setPostItem('');
    setPostQuantity(0);
    setDesireQuantity(0);
    setDesiteItem('');
  };

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      setTradingBoard(tradingAreaController.tradingBoard);
      setPlayerInventory(tradingAreaController.inventory);
    };
    tradingAreaController.addListener('tradingAreaUpdated', updateInventoryAreaModel);

    return () => {
      tradingAreaController.removeListener('tradingAreaUpdated', updateInventoryAreaModel);
    };
  }, [tradingAreaController, tradingBoard, playerInventory]);

  return (
    <Container className='TradingBoard' marginLeft='0!important'>
      <Container>
        <Heading>Trading Board</Heading>
        <Accordion allowToggle>
          <AccordionItem>
            <Heading as='h2'>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Request an Item
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <InputLabel>Which item will you offer:</InputLabel>
                <Input
                  placeholder='Offer item'
                  value={postItem}
                  onChange={e => setPostItem(e.target.value)}
                />
                <InputLabel>How much of it:</InputLabel>
                <Input
                  placeholder='Offer quantity'
                  type='number'
                  value={postQuantity}
                  onChange={e => setPostQuantity(Number(e.target.value) || 0)}
                />
                <InputLabel>Which item do you desire:</InputLabel>
                <Input
                  placeholder='Desire item'
                  value={desireItem}
                  onChange={e => setDesiteItem(e.target.value)}
                />
                <InputLabel>How much of it?:</InputLabel>

                <Input
                  placeholder='Desire quantity'
                  type='number'
                  value={desireQuantity}
                  onChange={e => setDesireQuantity(Number(e.target.value) || 0)}
                />
                <Button
                  colorScheme='blue'
                  onClick={async () => {
                    try {
                      await handlePostItem(postItem, postQuantity, desireItem, desireQuantity);
                    } catch (err) {
                      toast({
                        title: 'Error post item',
                        description: (err as Error).toString(),
                        status: 'error',
                      });
                    }
                  }}>
                  Post
                </Button>
              </AccordionPanel>
            </Heading>
          </AccordionItem>
        </Accordion>
      </Container>
      <Container className='Inventory Table'>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                Want to take a look at your inventory?
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
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
                        <Td>
                          {iconMap[item.name] ? (
                            React.createElement(iconMap[item.name])
                          ) : (
                            <NoIcon />
                          )}
                        </Td>
                        <Td>{item.price}</Td>
                        <Td>{item.quantity}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Container>
      {tradingBoard && (
        <Container>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Item</Th>
                <Th></Th>
                <Th>Quantity</Th>
                <Th>Wanted</Th>
                <Th></Th>
                <Th>Wanted Num</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tradingBoard.map((item: TradingOffer) => (
                <Tr key={item.playerName}>
                  <Td>{item.playerName}</Td>
                  <Td>{item.item}</Td>
                  <Td>
                    {iconMap[item.item] ? React.createElement(iconMap[item.item]) : <NoIcon />}
                  </Td>
                  <Td>{item.quantity}</Td>
                  <Td>{item.itemDesire}</Td>
                  <Td>
                    {iconMap[item.itemDesire] ? (
                      React.createElement(iconMap[item.itemDesire])
                    ) : (
                      <NoIcon />
                    )}
                  </Td>
                  <Td>{item.quantityDesire}</Td>
                  <Td>
                    <Button
                      colorScheme='green'
                      variant='solid'
                      size='md'
                      borderRadius='md'
                      onClick={async () => {
                        try {
                          await tradingAreaController.handleAcceptTradingOffer(
                            item.playerID,
                            item.item,
                            item.quantity,
                            item.itemDesire,
                            item.quantityDesire,
                          );
                        } catch (err) {
                          toast({
                            title: 'Error post item',
                            description: (err as Error).toString(),
                            status: 'error',
                          });
                        }
                      }}>
                      Accept
                    </Button>
                  </Td>

                  <Td>
                    <Button
                      colorScheme='red'
                      variant='solid'
                      size='md'
                      borderRadius='md'
                      disabled={item.playerID !== tradingAreaController.playerID}
                      onClick={async () => {
                        try {
                          await tradingAreaController.handleDeleteOffer(item.playerID);
                        } catch (err) {
                          toast({
                            title: 'Error post item',
                            description: (err as Error).toString(),
                            status: 'error',
                          });
                        }
                      }}>
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>
      )}
    </Container>
  );
}

export default function TradingAreaWrapper(): JSX.Element {
  const tradingArea = useInteractable<TradingAreaInteractable>('tradingArea');
  const townController = useTownController();
  let controller;
  if (tradingArea) {
    controller = townController.getTradingAreaController(tradingArea);
  }
  const closeModal = useCallback(() => {
    if (tradingArea) {
      townController.interactEnd(tradingArea);
    }
  }, [townController, tradingArea]);

  useEffect(() => {
    if (tradingArea) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, tradingArea]);

  if (tradingArea) {
    controller?.handleOpenTradingBoard();
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
        <ModalContent minWidth='fit-content' minHeight='fit-content' marginLeft='0!important'>
          <ModalHeader>{tradingArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width='130vh' height='100vh' overflow='auto' marginLeft='0!important'>
            <TradingBoard interactableID={tradingArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
