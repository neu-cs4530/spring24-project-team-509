import { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import TradingAreaController from '../../../classes/interactable/TradingAreaController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';
import TradingAreaInteractable from './TradingArea';
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
import { TradingArea as TradingAreaModel } from '../../../types/CoveyTownSocket';
import { supabase } from '../../../supabaseClient';

type tradingRows = {
  id: string;
  name: string;
  item: string;
  quantity: number;
};

export function TradingBoard({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [tradingBoard, setTradingBoard] = useState<any[] | null>([]);
  const [dbError, setdbError] = useState<string | null>(null);

  const tradingAreaController =
    useInteractableAreaController<TradingAreaController>(interactableID);

  const [TradingAreaModel, setTradingAreaModel] = useState<TradingAreaModel>(
    tradingAreaController.toInteractableAreaModel(),
  );

  const fetchTradingBoard = async () => {
    setTradingBoard(tradingAreaController.tradingBoard);
  }

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
        size='xl'
      >
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
