import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import Toggle from '../Toggle';
import { RecordGroup } from '../../utils/types';

interface Props {
  show: boolean;
  isEdit?: boolean;
  groupData?: RecordGroup;
  onClose: () => void;
  onOk?: (name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => void;
}

export const NewGroupModal = ({ show, isEdit = false, groupData, onClose, onOk }: Props) => {
  const [name, setname] = useState(isEdit ? groupData?.name ?? '' : '');
  const [desc, setdesc] = useState(isEdit ? groupData?.desc ?? '' : '');
  const [tips, setTips] = useState('');
  const [isPublic, setisPublic] = useState(isEdit ? groupData?.is_public ?? true : true);
  const [showLivedLevel, setshowLivedLevel] = useState(isEdit ? groupData?.show_lived_level ?? false : false);

  useEffect(() => {
    setname(isEdit ? groupData?.name ?? '' : '');
    setdesc(isEdit ? groupData?.desc ?? '' : '');
    setisPublic(isEdit ? groupData?.is_public ?? true : true);
    setshowLivedLevel(isEdit ? groupData?.show_lived_level ?? false : false);
  }, [groupData]);

  useEffect(() => {
    if (show === false) {
      setname('');
      setdesc('');
      setisPublic(true);
      setshowLivedLevel(false);
    }
  }, [show]);

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
      title={isEdit ? name + ' を編集' : '新規記録地図'}
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
        <div className='flex'>
          <span>候補：</span>
          <ul className='flex' style={{listStyle: 'none'}}>
            {['行脚記録', '旅行記録', '足跡'].map(candidate => {
              return (
                <li style={{color: '#2d72d2', cursor: 'pointer'}}
                  onClick={() => {
                    setname(candidate);
                  }}
                >
                  {candidate}
                </li>
              );
            })}
          </ul>
        </div>
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
            bgColor="#234285"
            value={isPublic}
            onChange={e => {
              setisPublic(e);
            }}
          />
          <span>ランキングに公開</span>
        </label>

        <label>
          <Toggle
            bgColor="#234285"
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
