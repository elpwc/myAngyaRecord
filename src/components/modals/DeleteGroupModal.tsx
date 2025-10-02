import { useState } from 'react';
import { Modal } from '../InfrastructureCompo/Modal';
import './modals.css';

interface Props {
  show: boolean;
  onClose: () => void;
  onOk?: () => void;
}

export const DeleteGroupModal = ({ show, onClose, onOk }: Props) => {
  return (
    <Modal isOpen={show} mobileMode="center" onClose={onClose} onOk={onOk} title="本当に削除しますか？" showOkButton showCancelButton>
      <></>
    </Modal>
  );
};
