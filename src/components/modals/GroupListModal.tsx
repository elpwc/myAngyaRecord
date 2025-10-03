import { useEffect, useState } from 'react';
import { Modal } from '../InfrastructureCompo/Modal';
import { getRecordGroups, patchRecordGroup, postRecordGroup } from '../../utils/serverUtils';
import { MapsId } from '../../utils/map';
import { RecordGroup } from '../../utils/types';
import './modals.css';
import moment from 'moment';
import { NewGroupModal } from './NewGroupModal';
import Toggle from '../InfrastructureCompo/Toggle';
import { useHint } from '../InfrastructureCompo/HintProvider';
import { GroupControlButtonGroup } from './GroupControlButtonGroup';

interface Props {
  show: boolean;
  mapid: MapsId;
  onClose: () => void;
  onSelect?: (recordGroup: RecordGroup) => void;
}

export const GroupListModal = ({ show, mapid, onClose, onSelect }: Props) => {
  const hint = useHint();

  const [recordGroups, setrecordGroups] = useState<RecordGroup[]>([]);
  const [showNewModal, setshowNewModal] = useState(false);
  const [isPublicToggleDisable, setisPublicToggleDisable] = useState(false);
  const [showNewModalToggleDisable, setshowNewModalToggleDisable] = useState(false);

  const refreshRecordGroups = (onOK?: (data: RecordGroup[]) => void) => {
    getRecordGroups(
      mapid,
      data => {
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
              key={recordGroup.id}
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
                <GroupControlButtonGroup
                  recordGroup={recordGroup}
                  onRecordGroupsInfoUpdate={() => {
                    refreshRecordGroups();
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
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
    </Modal>
  );
};
