import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import TradingAreaInteractable from './TradingArea';
import {
  Button,
  Container,
  Heading,
  Input,
  InputGroup,
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
import { TradingArea as TradingAreaModel } from '../../../types/CoveyTownSocket';
import React from 'react';

type TradingRows = {
  id: string;
  name: string;
  item: string;
  quantity: number;
};

export function TradingBoard({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [tradingBoard, setTradingBoard] = useState<any[] | null>([]);
  const [dbError, setdbError] = useState<string | null>(null);
  const [postItem, setPostItem] = useState<string | null>('');
  const [postQuantity, setPostQuantity] = useState<number>(0);

  const tradingAreaController =
    useInteractableAreaController<TradingAreaController>(interactableID);

  const [tradingAreaModel, setTradingAreaModel] = useState<TradingAreaModel>(
    tradingAreaController.toInteractableAreaModel(),
  );

  const fetchTradingBoard = async () => {
    setTradingBoard(tradingAreaController.tradingBoard);
  };

  const handlePostItem = async (item: string, quantity: number) => {
    console.log('posting item', item, quantity);
  };

  const handleAcceptItem = async (playerName: string, item: string, quantity: number) => {
    console.log('accepting item', playerName, item, quantity);
  };

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      setTradingAreaModel(tradingAreaController.toInteractableAreaModel());
    };
    tradingAreaController.addListener('tradingAreaUpdated', updateInventoryAreaModel);
    fetchTradingBoard();
    return () => {
      tradingAreaController.removeListener('tradingAreaUpdated', updateInventoryAreaModel);
    };
  }, [tradingAreaController, tradingBoard]);

  return (
    <Container className='TradingBoard'>
      <Heading>Trading Board</Heading>
      <InputGroup size='md' width='auto'>
        <Input placeholder='Offer item' onChange={e => setPostItem(e.target.value)} />
        <Input
          placeholder='Offer quantity'
          type='number'
          onChange={e => setPostQuantity(Number(e.target.value) || 0)}
        />
        <Button colorScheme='blue' onClick={() => handlePostItem(postItem || '', postQuantity)}>
          Post
        </Button>
      </InputGroup>
      {tradingBoard && (
        <Container>
          <Table>
            <Thead>
              <Tr>
                <Th>Player Name</Th>
                <Th>Item</Th>
                <Th>Quantity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tradingBoard
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item: any) => (
                  <Tr key={item.playerName}>
                    <Td>{item.playerName}</Td>
                    <Td>{item.item}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>
                      <Button
                        colorScheme='green'
                        size='md'
                        onClick={() => handleAcceptItem(item.playerName, item.name, item.quantity)}>
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
        <ModalContent>
          <ModalHeader>{tradingArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TradingBoard interactableID={tradingArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
