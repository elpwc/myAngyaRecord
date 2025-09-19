import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { deleteRecordGroup, getRecordGroups, patchRecordGroup, postRecordGroup } from '../../utils/serverUtils';
import { getMapUrlByMapsId, MapsId } from '../../utils/map';
import { RecordGroup } from '../../utils/types';
import './modals.css';
import moment from 'moment';
import { DeleteGroupModal } from './DeleteGroupModal';
import { NewGroupModal } from './NewGroupModal';
import Toggle from '../Toggle';
import appconfig from '../../appconfig';
import { useHint } from '../HintProvider';

interface Props {
  show: boolean;
  mapid: MapsId;
  onClose: () => void;
  onSelect?: (recordGroup: RecordGroup) => void;
}

export const GroupListModal = ({ show, mapid, onClose, onSelect }: Props) => {
  const hint = useHint();

  const [recordGroups, setrecordGroups] = useState<RecordGroup[]>([]);
  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const [showNewModal, setshowNewModal] = useState(false);
  const [showEditModal, setshowEditModal] = useState(false);
  const [isPublicToggleDisable, setisPublicToggleDisable] = useState(false);
  const [showNewModalToggleDisable, setshowNewModalToggleDisable] = useState(false);
  const [editOrDeletedRecordGroupIndex, seteditOrDeletedRecordGroupIndex] = useState(-1);

  const refreshRecordGroups = (onOK?: (data: RecordGroup[]) => void) => {
    getRecordGroups(
      mapid,
      data => {
        console.log(data);
        setrecordGroups(data);
        onOK?.(data);
      },
      e => {
        console.log(e);
      }
    );
  };

  useEffect(() => {
    if (show) {
      refreshRecordGroups();
    }
  }, [show, mapid]);

  return (
    <Modal isOpen={show} onClose={onClose} title="My行脚地図一覧">
      <ul className="recordGroupsList">
        <li
          className="recordGroupsListItem"
          onClick={() => {
            setshowNewModal(true);
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
              新規記録地図
            </span>
          </div>
        </li>
        {recordGroups.map((recordGroup: RecordGroup, index: number) => {
          return (
            <li
              className="recordGroupsListItem"
              onClick={() => {
                onSelect?.(recordGroup);
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '100%' }}>
                  <p>{recordGroup.name}</p>
                  <p style={{ fontSize: '12px', marginBottom: '5px' }}>{recordGroup.desc.length === 0 ? '　' : recordGroup.desc}</p>
                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ marginRight: '12px' }}>
                      <Toggle
                        size={0.8}
                        bgColor="#234285"
                        disabled={isPublicToggleDisable}
                        value={recordGroup.is_public}
                        onChange={value => {
                          setisPublicToggleDisable(true);
                          patchRecordGroup(
                            recordGroup.id,
                            data => {
                              refreshRecordGroups();
                              setisPublicToggleDisable(false);
                            },
                            errormsg => {
                              alert(errormsg);
                              setisPublicToggleDisable(false);
                            },
                            { is_public: Boolean(value) }
                          );
                        }}
                      />
                      <span>ランキングに公開</span>
                    </label>

                    <label>
                      <Toggle
                        size={0.8}
                        bgColor="#234285"
                        disabled={!recordGroup.is_public || showNewModalToggleDisable}
                        value={recordGroup.show_lived_level}
                        onChange={value => {
                          setshowNewModalToggleDisable(true);
                          patchRecordGroup(
                            recordGroup.id,
                            data => {
                              refreshRecordGroups();
                              setshowNewModalToggleDisable(false);
                            },
                            errormsg => {
                              alert(errormsg);
                              setshowNewModalToggleDisable(false);
                            },
                            { show_lived_level: Boolean(value) }
                          );
                        }}
                      />
                      <span style={{ color: recordGroup.is_public ? 'black' : 'lightgray' }}>公開の際は閲覧者に「居住」を「宿泊」様式で表示</span>
                    </label>
                    <time style={{ color: 'gray', fontSize: '10px', display: 'flex', gap: '10px' }}>
                      <span>{`作成 ${moment(recordGroup.create_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                      <span>{`最後更新 ${moment(recordGroup.update_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                    </time>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* EditButton */}
                  <button
                    className="singleIcon-button"
                    onClick={e => {
                      e.stopPropagation();
                      seteditOrDeletedRecordGroupIndex(index);
                      setshowEditModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                      <path
                        fillRule="evenodd"
                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                      />
                    </svg>
                  </button>
                  {/* DeleteButton */}
                  <button
                    className="singleIcon-button"
                    onClick={e => {
                      e.stopPropagation();
                      seteditOrDeletedRecordGroupIndex(index);
                      setshowDeleteModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                    </svg>
                  </button>
                  {/* ShareButton */}
                  <button
                    className="singleIcon-button"
                    onClick={e => {
                      e.stopPropagation();

                      navigator.clipboard
                        .writeText(`${appconfig.siteBaseURL}/${getMapUrlByMapsId(mapid)}/${recordGroup.id}`)
                        .then(() => hint('bottom', 'この行脚記録のURLをｸﾘｯﾌﾟﾎﾞｰﾄにコピーしました！'))
                        .catch(err => hint('bottom', 'この行脚記録のURLをｸﾘｯﾌﾟﾎﾞｰﾄにコピーできませんでした！', 'red', 2000));
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <DeleteGroupModal
        show={showDeleteModal}
        onClose={() => {
          setshowDeleteModal(false);
        }}
        onOk={() => {
          if (editOrDeletedRecordGroupIndex >= 0) {
            deleteRecordGroup(
              recordGroups[editOrDeletedRecordGroupIndex].id,
              data => {
                seteditOrDeletedRecordGroupIndex(-1);
                setshowDeleteModal(false);
                refreshRecordGroups();
              },
              e => {
                seteditOrDeletedRecordGroupIndex(-1);
                alert('削除失敗');
              }
            );
          }
        }}
      />
      <NewGroupModal
        show={showNewModal}
        onClose={() => {
          setshowNewModal(false);
        }}
        onOk={(name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => {
          postRecordGroup(
            mapid,
            name,
            desc,
            isPublic,
            showLivedLevel,
            (data: any) => {
              refreshRecordGroups((data: RecordGroup[]) => {
                onSelect?.(data[data.length - 1]);
              });
              setshowNewModal(false);
            },
            errmsg => {
              alert(errmsg);
            }
          );
        }}
      />
      {/* EditModal */}
      <NewGroupModal
        show={showEditModal}
        isEdit={true}
        groupData={recordGroups[editOrDeletedRecordGroupIndex]}
        onClose={() => {
          setshowEditModal(false);
        }}
        onOk={(name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => {
          console.log(name, desc, isPublic, showLivedLevel);
          if (editOrDeletedRecordGroupIndex < 0) {
            return;
          }
          patchRecordGroup(
            recordGroups[editOrDeletedRecordGroupIndex].id,
            (data: any) => {
              refreshRecordGroups();
              seteditOrDeletedRecordGroupIndex(-1);
              setshowEditModal(false);
            },
            errmsg => {
              seteditOrDeletedRecordGroupIndex(-1);
              alert(errmsg);
            },
            {
              name,
              desc,
              is_public: Boolean(isPublic),
              show_lived_level: Boolean(showLivedLevel),
            }
          );
        }}
      />
    </Modal>
  );
};
