import { useState } from 'react';
import { Modal } from '../Modal';
import Toggle from '../Toggle';

interface Props {
  show: boolean;
  onClose: () => void;
  onOk?: (name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => void;
}

export const NewGroupModal = ({ show, onClose, onOk }: Props) => {
  const [name, setname] = useState('');
  const [desc, setdesc] = useState('');
  const [tips, setTips] = useState('');
  const [isPublic, setisPublic] = useState(true);
  const [showLivedLevel, setshowLivedLevel] = useState(false);

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
          onOk?.(name, desc, isPublic, showLivedLevel);
        }
      }}
      title="新規記録地図"
      showOkButton
      showCancelButton
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          placeholder={`名称*(必須)`}
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
        <label>
          <Toggle
            value={isPublic}
            onChange={e => {
              setisPublic(e);
            }}
          />
          <span>ランキングに公開</span>
        </label>

        <label>
          <Toggle
            disabled={!isPublic}
            value={showLivedLevel}
            onChange={e => {
              setshowLivedLevel(e);
            }}
          />
          <span style={{ color: isPublic ? 'black' : 'lightgray' }}>個人情報漏洩防止のため、公開の際は閲覧者に「居住」を「宿泊」様式で表示</span>
        </label>
        <p style={{ color: '#cd4246' }}>{tips}</p>
      </div>
    </Modal>
  );
};
