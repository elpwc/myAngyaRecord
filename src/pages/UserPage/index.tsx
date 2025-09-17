import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { Modal } from '../../components/Modal';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { RecordGroup } from '../../utils/types';
import { mapStyles } from '../../utils/mapStyles';
import { recordStatus } from '../../utils/map';
import { useGlobalStore } from '../../utils/globalStore';
import { useHint } from '../../components/HintProvider';
import { c_uid } from '../../utils/cookies';
import { updateUserAvatar } from '../../utils/serverUtils';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const hint = useHint();

  const userId = params.id || '-1';

  // let currentId: string = params.id as string;

  const [avatar, setAvatar] = useState(defaultAvatar);
  const [profileEditModalAvatar, setProfileEditModalAvatar] = useState(defaultAvatar);
  const [profileEditModalUsername, setProfileEditModalUsername] = useState('');
  const [profileEditModalHitokoto, setProfileEditModalHitokoto] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const [recordGroups, setRecordGroups] = useState<RecordGroup[]>([]);

  const [currentMapStyle, setCurrentMapStyle] = useGlobalStore(s => s.mapStyle);

  const [isSelfUser, setIsSelfUser] = useState(userId === c_uid() && userId !== '-1');

  useEffect(() => {
    document.title = 'ユーザー設定 - My行脚記録';
  }, []);

  return (
    <div className="container">
      <section className="user-header">
        <img src={avatar} alt="avatar" className="avatar" />
        <div className="user-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="username">{'aaaa'}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#c0c0c0' }}>
              <span>id: {userId}</span>
              <span>{}から利用している</span>
            </div>
          </div>
          {isSelfUser && (
            <button className="edit-btn" onClick={() => setShowEditModal(true)}>
              プロフィール編集
            </button>
          )}
        </div>
      </section>

      <section className="records">
        <h2>{isSelfUser ? '私の記録' : '公開の記録'}</h2>
        <ul>
          {recordGroups.map(group => (
            <li key={group.id} className="record-item">
              <div className="record-title">{group.name}</div>
              <div className="record-date">{group.create_date}</div>
              {group.desc && <div className="record-desc">{group.desc}</div>}
            </li>
          ))}
        </ul>
      </section>

      {isSelfUser && (
        <section className="system-settings">
          <h2>システム設定</h2>
          <span>地図テーマ</span>
          {mapStyles.map((mapStyle, index) => {
            return (
              <div key={mapStyle.name} style={{ marginBottom: '12px' }}>
                <label>
                  <input
                    type="radio"
                    name="mapStyle"
                    value={mapStyle.name}
                    defaultChecked={currentMapStyle === index}
                    onClick={e => {
                      if (e.currentTarget.checked) {
                        setCurrentMapStyle((s: any) => ({ ...s, mapStyle: index }));
                        hint('bottom', '地図テーマを変更しました');
                      }
                    }}
                  />
                  <span>{mapStyle.title}</span>
                  <div style={{ display: 'flex', borderRadius: '8px', border: 'solid 1px #e0e0e0', width: 'fit-content' }}>
                    {recordStatus.map(recordStatusItem => {
                      return (
                        <div
                          key={recordStatusItem.value}
                          style={{
                            backgroundColor: mapStyle.bgcolor[recordStatusItem.value],
                            color: mapStyle.color[recordStatusItem.value],
                            padding: '6px',
                            borderRadius: recordStatusItem.value === 5 ? '8px 0 0 8px' : recordStatusItem.value === 0 ? '0 8px 8px 0' : '0px',
                          }}
                        >
                          {recordStatusItem.name}
                        </div>
                      );
                    })}
                  </div>
                </label>
              </div>
            );
          })}
        </section>
      )}

      <footer className="page-footer">
        <p>My行脚記録 © 2025 — このサイトについて</p>
      </footer>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        title="プロフィール編集"
        showOkButton
        showCancelButton
        onOk={() => {
          setShowEditModal(false);
        }}
      >
        <div className="modal">
          <label>
            ニックネーム
            <input type="text" value={profileEditModalUsername} onChange={e => setProfileEditModalUsername(e.target.value)} placeholder="ニックネーム" />
          </label>
          <label>
            <span>アバター変更</span>
            <img src={profileEditModalAvatar} alt="avatar" className="avatar" />
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setProfileEditModalAvatar(URL.createObjectURL(file));
                  updateUserAvatar(
                    Number(userId),
                    file,
                    e => {
                      console.log(e);
                    },
                    e => {
                      console.log(e);
                    }
                  );
                }
              }}
            />
          </label>
          <label>
            一言
            <input type="text" value={profileEditModalHitokoto} onChange={e => setProfileEditModalHitokoto(e.target.value)} placeholder="一言" />
          </label>
          <label>
            パスワード
            <a href="">パスワード変更</a>
          </label>
        </div>
      </Modal>
    </div>
  );
};
