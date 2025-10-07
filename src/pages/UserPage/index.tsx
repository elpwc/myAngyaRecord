import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { Modal } from '../../components/InfrastructureCompo/Modal';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { RecordGroup } from '../../utils/types';
import { getMapStyleBgColor, getMapStyleColor, mapStyles } from '../../utils/mapStyles';
import { getMapTitleByMapsId, getMapUrlByMapsId, recordStatus } from '../../utils/map';
import { useHint } from '../../components/InfrastructureCompo/HintProvider';
import { getRecordGroupsInAllMapsByUserID, getUserInfoById, updateUserAvatar, updateUserInfo } from '../../utils/serverUtils';
import imageCompression from 'browser-image-compression';
import { c_mapStyle, c_privateRailwayLineStyle, c_uid } from '../../utils/cookies';
import { getAvatarFullURL, logout } from '../../utils/userUtils';
import { useAppContext } from '../../context';
import { PrivateRailwayLineStyle } from '../../utils/mapInfo';
import { GroupControlButtonGroup } from '../../components/modals/GroupControlButtonGroup';

interface P {}

/** 暂时选中的头像文件 */
let avatarFile: File | null = null;

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const hint = useHint();

  const userId = params.id || '-1';

  // let currentId: string = params.id as string;

  const [userInfo, setUserInfo] = useState({
    avatar: defaultAvatar,
    name: '',
    hitokoto: '',
    createTime: '',
  });
  const [profileEditModalAvatar, setProfileEditModalAvatar] = useState(defaultAvatar);
  const [profileEditModalUsername, setProfileEditModalUsername] = useState('');
  const [profileEditModalHitokoto, setProfileEditModalHitokoto] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const [recordGroups, setRecordGroups] = useState<RecordGroup[]>([]);

  const { currentMapStyle, setCurrentMapStyle } = useAppContext();
  const { privateRailwayLineStyle, setPrivateRailwayLineStyle } = useAppContext();

  const [isSelfUser, setIsSelfUser] = useState(userId === c_uid() && userId !== '-1');

  const refreshRecordGroups = (onOK?: (data: RecordGroup[]) => void) => {
    getRecordGroupsInAllMapsByUserID(
      userId,
      (data: RecordGroup[]) => {
        setRecordGroups(data);
        onOK?.(data);
      },
      (e: any) => {
        console.log(e);
      }
    );
  };
  console.log(privateRailwayLineStyle);

  useEffect(() => {
    document.title = 'ユーザー設定 - My行脚記録';
    refreshRecordGroups();
  }, []);

  useEffect(() => {
    getUserInfoById(
      Number(userId),
      data => {
        setUserInfo({
          avatar: getAvatarFullURL(data.avatar_url),
          name: data.name || '',
          hitokoto: data.hitokoto || '',
          createTime: data.create_date || '',
        });
        setProfileEditModalAvatar(getAvatarFullURL(data.avatar_url));
        setProfileEditModalUsername(data.name || '');
        setProfileEditModalHitokoto(data.hitokoto || '');
      },
      msg => {
        console.log(msg);
        hint('top', 'ユーザー情報の取得に失敗しました');
        navigate('/404');
      }
    );
  }, [userId]);

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    // <5mb
    const maxSizeMB = 5;
    if (avatarFile.size > maxSizeMB * 1024 * 1024) {
      hint('bottom', `ファイルサイズが ${maxSizeMB}MBを超えています。より小さいファイルを選択してください。`);
      return;
    }

    try {
      const options = {
        maxSizeMB: 0.3, //0.3mb
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      const compressedFile = await imageCompression(avatarFile, options);

      //console.log(` ${(avatarFile.size / 1024).toFixed(1)}KB →  ${(compressedFile.size / 1024).toFixed(1)}KB`);

      updateUserAvatar(
        Number(userId),
        compressedFile,
        data => {
          setUserInfo({ ...userInfo, avatar: data.avatar_url });
        },
        e => {
          console.log(e);
        }
      );
    } catch (err) {
      hint('bottom', '画像の圧縮に失敗しました');
    }
  };

  return (
    <div className="container">
      <section className="user-header">
        <img src={userInfo.avatar} alt="avatar" className="avatar" />
        <div className="user-meta">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <h1 className="username flex">
              {userInfo.name}
              <span style={{ fontSize: '12px', color: '#c0c0c0', fontWeight: 'normal', marginLeft: '4px' }}>{userId}</span>
            </h1>
            <span style={{ fontSize: '14px' }}>{userInfo.hitokoto}</span>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#c0c0c0' }}>
              <span>{`${userInfo.createTime.split(' ')[0]}`}から利用している</span>
            </div>
          </div>
          {isSelfUser && (
            <div className="flex" style={{ flexWrap: 'wrap' }}>
              <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                プロフィール編集
              </button>
              <button
                className="logout-btn"
                onClick={() => {
                  logout();
                  navigate('/japan');
                }}
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="records">
        <h2>{isSelfUser ? '私の記録' : '公開された記録'}</h2>
        <ul>
          {recordGroups.map((group: RecordGroup) => {
            if (userId === c_uid() || group.is_public) {
              return (
                <li key={group.id} className="record-item">
                  <Link to={`/${getMapUrlByMapsId(group.mapid)}/` + group.id} target="_blank" className="link">
                    <div className="record-title">{getMapTitleByMapsId(group.mapid) + ' ' + group.name + ' ' + (group.is_public ? '' : '(非公開)')}</div>
                    <div className="record-date">{group.create_date}</div>
                    {group.desc && <div className="record-desc">{group.desc}</div>}
                  </Link>
                  {isSelfUser && <GroupControlButtonGroup recordGroup={group} direction="row" onRecordGroupsInfoUpdate={() => refreshRecordGroups()} />}
                </li>
              );
            } else {
              return <></>;
            }
          })}
        </ul>
      </section>

      {isSelfUser && (
        <section className="system-settings" id="settings">
          <h2>システム設定</h2>
          <div className="system-settings-item">
            <span className="system-settings-item-title">地図テーマ</span>
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
                          setCurrentMapStyle(index);
                          c_mapStyle(index);
                          hint('bottom', '地図テーマを変更しました');
                        }
                      }}
                    />
                    <span>{mapStyle.title}</span>
                    <div style={{ display: 'flex', borderRadius: '8px', border: 'solid 1px #e0e0e0', width: 'fit-content' }}>
                      {recordStatus.map((recordStatusItem, jndex) => {
                        return (
                          <div
                            key={recordStatusItem.value}
                            style={{
                              backgroundColor: getMapStyleBgColor(index, recordStatusItem.value),
                              color: getMapStyleColor(index, recordStatusItem.value),
                              padding: '6px',
                              borderRadius: jndex === 0 ? '8px 0 0 8px' : jndex === recordStatus.length - 1 ? '0 8px 8px 0' : '0px',
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
          </div>
          <div className="system-settings-item" style={{ fontSize: '16px' }}>
            <span className="system-settings-item-title">私鉄線様式</span>
            <label>
              <input
                type="radio"
                name="privateRailwayLineStyle"
                checked={privateRailwayLineStyle === PrivateRailwayLineStyle.PlusLine}
                onChange={e => {
                  setPrivateRailwayLineStyle(PrivateRailwayLineStyle.PlusLine);
                  c_privateRailwayLineStyle(PrivateRailwayLineStyle.PlusLine);
                }}
              />
              +++++様式<span style={{ color: 'gray', fontSize: '14px' }}>（地図の操作が重たくなる可能性有り）</span>
            </label>
            <label>
              <input
                type="radio"
                name="privateRailwayLineStyle"
                checked={privateRailwayLineStyle === PrivateRailwayLineStyle.RedLine}
                onChange={e => {
                  setPrivateRailwayLineStyle(PrivateRailwayLineStyle.RedLine);
                  c_privateRailwayLineStyle(PrivateRailwayLineStyle.RedLine);
                }}
              />
              赤い線様式
            </label>
          </div>
        </section>
      )}

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
          // update user info
          updateUserInfo(
            Number(userId),
            {
              name: profileEditModalUsername,
              hitokoto: profileEditModalHitokoto,
            },
            data => {
              setUserInfo({ ...userInfo, name: profileEditModalUsername, hitokoto: profileEditModalHitokoto });
            },
            e => {
              console.log(e);
            }
          );

          // upload avatar
          handleAvatarUpload();
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
                  avatarFile = file;
                  setProfileEditModalAvatar(URL.createObjectURL(file));
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
