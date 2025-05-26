import { useState } from 'react';
import { Modal } from '../Modal';
import './modals.css';

interface Props {
  show: boolean;
  onClose: () => void;
  onOk?: (name: string, desc: string) => void;
}

export const NewGroupModal = ({ show, onClose, onOk }: Props) => {
  const [name, setname] = useState('');
  const [desc, setdesc] = useState('');
  const [tips, setTips] = useState('');

  return (
    <Modal
      isOpen={show}
      mobileMode="center"
      onClose={onClose}
      onOk={() => {
        if (name === '') {
          setTips('何でもいいから名前を入力してくださいね');
        } else if (name.length > 100) {
          setTips('名前は100文字内にしてくださいね');
        } else if (desc.length > 300) {
          setTips('備考は300文字内にしてくださいね');
        } else {
          setTips('');
          onOk?.(name, desc);
        }
      }}
      title="新規地図"
      showOkButton
      showCancelButton
    >
      <div style={{display: 'flex', flexDirection:'column', gap: '8px'}}>
      <input
        type="text"
        placeholder={`名前*`}
        style={{ width: '100%', boxSizing: 'border-box', fontSize: '16px' }}
        value={name}
        onChange={e => {
          setname(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="備考"
        style={{ width: '100%', boxSizing: 'border-box', fontSize: '16px' }}
        value={desc}
        onChange={e => {
          setdesc(e.target.value);
        }}
      />
      <p style={{ color: '#cd4246' }}>{tips}</p>
      </div>

    </Modal>
  );
};
