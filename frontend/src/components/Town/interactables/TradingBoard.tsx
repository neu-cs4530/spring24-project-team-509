import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import TradingAreaInteractable from './TradingArea';
import {
  Button,
  chakra,
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
  useToast,
} from '@chakra-ui/react';
import { TradingArea as TradingAreaModel } from '../../../types/CoveyTownSocket';
import React from 'react';
import { set } from 'lodash';

type TradingRows = {
  id: string;
  name: string;
  item: string;
  quantity: number;
};

const StyledTradingBoard = chakra(Container, {
  baseStyle: {
    // display: 'auto',
    width: '1500px',
    height: '500px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

export function TradingBoard({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [tradingBoard, setTradingBoard] = useState<any[] | null>([]);
  const [postItem, setPostItem] = useState<string>('');
  const [postQuantity, setPostQuantity] = useState<number>(0);
  const [desireItem, setDesiteItem] = useState<string>('');
  const [desireQuantity, setDesireQuantity] = useState<number>(0);
  const toast = useToast();

  const tradingAreaController =
    useInteractableAreaController<TradingAreaController>(interactableID);

  const [tradingAreaModel, setTradingAreaModel] = useState<TradingAreaModel>(
    tradingAreaController.toInteractableAreaModel(),
  );

  const fetchTradingBoard = async () => {
    setTradingBoard(tradingAreaController.tradingBoard);
  };

  const handlePostItem = async (item: string, quantity: number, desireItem: string, desireQuantity: number) => {
    console.log('posting item', item, quantity, desireItem, desireQuantity);
    await tradingAreaController.handlePostTradingOffer(item, quantity, desireItem, desireQuantity);
    setPostItem('');
    setPostQuantity(0);
    setDesireQuantity(0); 
    setDesiteItem('');  
  };

  const handleAcceptItem = async (playerID:string, item: string, quantity: number, itemDesire: string, quantityDesire: number) => {
    console.log('accepting item', item, quantity, itemDesire, quantityDesire);
    await tradingAreaController.handleAcceptTradingOffer(playerID, item, quantity, itemDesire, quantityDesire);
  };

  useEffect(() => {
    const updateInventoryAreaModel = () => {
      setTradingAreaModel(tradingAreaController.toInteractableAreaModel());
      fetchTradingBoard();
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
        <Input placeholder='Offer item' value={postItem} onChange={e => setPostItem(e.target.value)} />
        <Input
          placeholder='Offer quantity'
          type='number'
          value={postQuantity}
          onChange={e => setPostQuantity(Number(e.target.value) || 0)}
        />
        <Input
          placeholder='Desire item'
          value={desireItem}
          onChange={e => setDesiteItem(e.target.value)}
        />
        <Input
          placeholder='Desire quantity'
          type='number'
          value={desireQuantity}
          onChange={e => setDesireQuantity(Number(e.target.value) || 0)}
        />
        <Button colorScheme='blue' onClick={async () => {
          try {
            await handlePostItem(postItem, postQuantity, desireItem, desireQuantity)
          } catch (err) {
            toast({
              title: 'Error posting offer',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
        }}>
          Post
        </Button>
      </InputGroup>
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
              {tradingBoard
                .map((item: any) => (
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
                          await handleAcceptItem(item.playerID, item.name, item.quantity, item.itemDesire, item.quantityDesire)
                        } catch (err) {
                          toast({
                            title: 'Error posting offer',
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
        size='full'>
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
