import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { deleteRecordGroup, getRecordGroups, patchRecordGroup, postRecordGroup } from '../../utils/serverUtils';
import { MapsId } from '../../utils/map';
import { RecordGroup } from '../../utils/types';
import './modals.css';
import moment from 'moment';
import { DeleteGroupModal } from './DeleteGroupModal';
import { NewGroupModal } from './NewGroupModal';
import Toggle from '../Toggle';

interface Props {
  show: boolean;
  mapid: MapsId;
  onClose: () => void;
  onSelect?: (recordGroup: RecordGroup) => void;
}

export const GroupListModal = ({ show, mapid, onClose, onSelect }: Props) => {
  const [recordGroups, setrecordGroups] = useState<RecordGroup[]>([]);
  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const [showNewModal, setshowNewModal] = useState(false);
  const [showEditModal, setshowEditModal] = useState(false);
  const [isPublicToggleDisable, setisPublicToggleDisable] = useState(false);
  const [showNewModalToggleDisable, setshowNewModalToggleDisable] = useState(false);
  const [editOrDeletedRecordGroupIndex, seteditOrDeletedRecordGroupIndex] = useState(-1);

  const refreshRecordGroups = () => {
    getRecordGroups(
      mapid,
      data => {
        console.log(data);
        setrecordGroups(data);
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
                  <div style={{ fontSize: '14px' }}>
                    <label style={{ marginRight: '12px' }}>
                      <Toggle
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
                            { is_public: value }
                          );
                        }}
                      />
                      <span>ランキングに公開</span>
                    </label>

                    <label>
                      <Toggle
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
                            { show_lived_level: value }
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
              refreshRecordGroups();
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
          patchRecordGroup(
            recordGroups[editOrDeletedRecordGroupIndex].id,
            (data: any) => {
              refreshRecordGroups();
              seteditOrDeletedRecordGroupIndex(-1);
              setshowNewModal(false);
            },
            errmsg => {
              seteditOrDeletedRecordGroupIndex(-1);
              alert(errmsg);
            },
            {
              name,
              desc,
              is_public: isPublic,
              show_lived_level: showLivedLevel,
            }
          );
        }}
      />
    </Modal>
  );
};
