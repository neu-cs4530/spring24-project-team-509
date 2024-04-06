import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import { InteractableID } from '../../../types/CoveyTownSocket';
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
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React from 'react';
import { InputLabel } from '@material-ui/core';
import ChatChannel from './ChatChannel';
import Inventory from './Inventory';

export function TradingBoard({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [tradingBoard, setTradingBoard] = useState<any[] | null>([]);
  const [postItem, setPostItem] = useState<string>('');
  const [postQuantity, setPostQuantity] = useState<number>(0);
  const [desireItem, setDesiteItem] = useState<string>('');
  const [desireQuantity, setDesireQuantity] = useState<number>(0);
  const [playerInventory, setPlayerInventory] = useState<any[] | null>([]);

  const toast = useToast();

  const tradingAreaController =
    useInteractableAreaController<TradingAreaController>(interactableID);

  const fetchTradingBoard = async () => {
    setTradingBoard(tradingAreaController.tradingBoard);
    setPlayerInventory(tradingAreaController.inventory);
  };

  const handlePostItem = async (
    item: string,
    quantity: number,
    wantedItem: string,
    wantedQuantity: number,
  ) => {
    console.log('posting item', item, quantity, wantedItem, wantedQuantity);
    await tradingAreaController.handlePostTradingOffer(item, quantity, wantedItem, wantedQuantity);
    setPostItem('');
    setPostQuantity(0);
    setDesireQuantity(0);
    setDesiteItem('');
  };

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      fetchTradingBoard();
    };
    tradingAreaController.addListener('tradingAreaUpdated', updateInventoryAreaModel);

    return () => {
      tradingAreaController.removeListener('tradingAreaUpdated', updateInventoryAreaModel);
    };
  }, [tradingAreaController, tradingBoard]);

  return (
    <Container className='TradingBoard' display='grid' grid-template-columns='70% 30%' gap='10px'>
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

        {tradingBoard && (
          <Container>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Item</Th>
                  <Th>Quantity</Th>
                  <Th>Wanted</Th>
                  <Th>Wanted Num</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tradingBoard.map((item: any) => (
                  <Tr key={item.playerName}>
                    <Td>{item.playerName}</Td>
                    <Td>{item.item}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{item.itemDesire}</Td>
                    <Td>{item.quantityDesire}</Td>
                    <Td>
                      <Button
                        colorScheme='green'
                        size='md'
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
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Container>
        )}
      </Container>
      <Container>
        <Box
          style={{
            height: '400px',
            overflowY: 'scroll',
          }}>
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
            <ChatChannel interactableID={interactableID} />
          </div>
        </Box>
      </Container>
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
        <ModalContent minWidth='fit-content' minHeight='fit-content'>
          <ModalHeader>{tradingArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width='100vh' height='80vh' overflow='auto'>
            <TradingBoard interactableID={tradingArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
