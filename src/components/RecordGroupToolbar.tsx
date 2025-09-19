import moment from 'moment';
import { MapsId } from '../utils/map';
import { GroupListModal } from './modals/GroupListModal';
import { NewGroupModal } from './modals/NewGroupModal';
import { RecordGroup } from '../utils/types';
import { useState } from 'react';
import { postRecordGroup } from '../utils/serverUtils';
import Avatar from './Avatar';
import { getAvatarFullURL } from '../utils/userUtils';
import { Link } from 'react-router';

export const RecordGroupToolbar = ({
  recordGroup,
  thisMapId,
  isViewMode,
  onSelectRecordGroup,
}: {
  recordGroup: RecordGroup | undefined;
  thisMapId: MapsId;
  isViewMode: boolean;
  onSelectRecordGroup: (recordGroup: RecordGroup) => void;
}) => {
  const [isGroupListModalOpen, setIsGroupListModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  return (
    <>
      <div className="groupSwitchContainer">
        <div style={{ width: '100%', padding: '4px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          {recordGroup ? (
            <>
              <div style={{ display: 'flex', gap: '6px' }}>
                <p>記録名:{recordGroup.name}</p>
                <p style={{ color: 'gray', fontSize: '12px', height: 'fit-content', alignSelf: 'end' }}>{recordGroup.desc}</p>
              </div>
              <time style={{ color: 'gray', fontSize: '10px', display: 'flex', gap: '10px' }}>
                <span>{`作成 ${moment(recordGroup.create_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                <span>{`最後更新 ${moment(recordGroup.update_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
              </time>
            </>
          ) : (
            <p>
              まだ記録がない
              <br />
              右のボタンで新規作成して下さい
            </p>
          )}
        </div>
        {isViewMode ? (
          <Link to={'/user/' + recordGroup?.uid} className='link' style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div className="flex" style={{ paddingRight: '4px' }}>
              <Avatar avatarUrl={recordGroup?.avatar_url} width={30} />
              <span>{recordGroup?.nickname}</span>
            </div>
          </Link>
        ) : (
          <div className="" style={{ display: 'flex', padding: '0px' }}>
            <button
              className="styled-button primary-button flex"
              onClick={() => setIsGroupListModalOpen(true)}
              style={{ borderRight: 'none', borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
                />
              </svg>
              {recordGroup ? '記録切り替え' : '記録を開く'}
            </button>
            <button className="styled-button flex" onClick={() => setIsNewGroupModalOpen(true)} style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
              新規記録地図
            </button>
          </div>
        )}
      </div>
      <GroupListModal
        mapid={thisMapId}
        show={isGroupListModalOpen}
        onClose={() => setIsGroupListModalOpen(false)}
        onSelect={(recordGroup: RecordGroup) => {
          onSelectRecordGroup(recordGroup);
          setIsGroupListModalOpen(false);
        }}
      />
      <NewGroupModal
        show={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        onOk={(name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => {
          postRecordGroup(
            thisMapId,
            name,
            desc,
            isPublic,
            showLivedLevel,
            (data: any) => {
              setIsNewGroupModalOpen(false);
            },
            errmsg => {
              alert(errmsg);
            }
          );
        }}
      />
    </>
  );
};
