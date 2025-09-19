import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { Modal } from '../../components/Modal';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { RecordGroup } from '../../utils/types';
import { mapStyles } from '../../utils/mapStyles';
import { getMapTitleByMapsId, getMapUrlByMapsId, recordStatus } from '../../utils/map';
import { useGlobalStore } from '../../utils/globalStore';
import { useHint } from '../../components/HintProvider';
import { getRecordGroupsInAllMapsByUserID, getUserInfoById, updateUserAvatar, updateUserInfo } from '../../utils/serverUtils';
import imageCompression from 'browser-image-compression';
import { c_mapStyle, c_uid } from '../../utils/cookies';
import { getAvatarFullURL, logout } from '../../utils/userUtils';
import Coffee from '../../components/Coffee';
import OuterLink from '../../components/OuterLink';

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

  const [currentMapStyle, setCurrentMapStyle] = useGlobalStore(s => s.mapStyle);

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
        hint('top', 'ユーザー情報の取得に失敗しました', 'error');
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
        e => {
          console.log(e);
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <h1 className="username">{userInfo.name}</h1>
            <span>{userInfo.hitokoto}</span>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#c0c0c0' }}>
              <span>id: {userId}</span>
              <span>{userInfo.createTime}から利用している</span>
            </div>
          </div>
          {isSelfUser && (
            <div className="flex">
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
                <Link key={group.id} to={`/${getMapUrlByMapsId(group.mapid)}/` + group.id} target="_blank" className="link">
                  <li className="record-item">
                    <div className="record-title">{getMapTitleByMapsId(group.mapid) + ' ' + group.name + ' ' + (group.is_public ? '' : '(非公開)')}</div>
                    <div className="record-date">{group.create_date}</div>
                    {group.desc && <div className="record-desc">{group.desc}</div>}
                  </li>
                </Link>
              );
            } else {
              return <></>;
            }
          })}
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
                        c_mapStyle(index.toString());
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

      <section className="system-settings">
        <h2>About</h2>
        <p>
          My行脚記録を使用していただき、誠にありがとうございます
          <br />
          <br />
          開発者の<OuterLink link="https://x.com/elpwc">うに</OuterLink>です
          <br />
          <br />
          My行脚記録は訪れた場所を「<span style={{ color: 'red' }}>色</span>」で記録できる地図サービスです
          <br />
          地図上の行政区をクリックするだけで、訪問状況をシンプルに残せます
          <br />
          色分けすることで、自分だけの「旅の履歴書」を直感的に作成できます
          <br />
          地図を眺めれば、これまでの旅の足跡がひと目でわかり、まだ行っていない場所への興味も広がります
          <br />
          <br />
          このサイトが、みんなの思い出の記録と次の冒険のきっかけになりますように
          <br />
          <br />
        </p>
        <p>もし気に入ったら、コーヒー１杯でご褒美してくれると大変喜びます</p>
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Coffee />
        </div>
      </section>

      <footer className="page-footer">
        <p>My行脚記録 © 2025</p>
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
          // update user info
          updateUserInfo(
            Number(userId),
            {
              name: profileEditModalUsername,
              hitokoto: profileEditModalHitokoto,
            },
            e => {
              console.log(e);
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
