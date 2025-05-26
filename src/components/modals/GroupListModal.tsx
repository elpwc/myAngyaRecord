import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { deleteRecordGroup, getRecordGroups, postRecordGroup } from '../../utils/serverUtils';
import { MapsId } from '../../utils/map';
import { RecordGroup } from '../../utils/types';
import './modals.css';
import moment from 'moment';
import { DeleteGroupModal } from './DeleteGroupModal';
import { NewGroupModal } from './NewGroupModal';

interface Props {
  show: boolean;
  mapid: MapsId;
  onClose: () => void;
  onSelect?: (recordGroup: RecordGroup) => void;
}

export const GroupListModal = ({ show, mapid, onClose, onSelect }: Props) => {
  const [recordGroups, setrecordGroups] = useState([]);
  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const [showNewModal, setshowNewModal] = useState(false);

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

  let groupToDelete: number = -1;

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
        {recordGroups.map((recordGroup: RecordGroup) => {
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
                  <p>{recordGroup.desc.length === 0 ? '　' : recordGroup.desc}</p>
                  <time style={{ color: 'gray', fontSize: '10px', display: 'flex', gap: '10px' }}>
                    <span>{`作成 ${moment(recordGroup.create_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                    <span>{`最後更新 ${moment(recordGroup.update_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                  </time>
                </div>
                <button
                  className="singleIcon-button"
                  onClick={e => {
                    e.stopPropagation();
                    groupToDelete = recordGroup.id;
                    setshowDeleteModal(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                  </svg>
                </button>
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
          if (groupToDelete >= 0) {
            deleteRecordGroup(
              groupToDelete,
              data => {
                groupToDelete = -1;
                setshowDeleteModal(false);
                refreshRecordGroups();
              },
              e => {
                groupToDelete = -1;
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
        onOk={(name: string, desc: string) => {
          postRecordGroup(
            mapid,
            name,
            desc,
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
    </Modal>
  );
};
