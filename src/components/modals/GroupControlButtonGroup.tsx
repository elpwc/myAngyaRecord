import React, { useState } from 'react';
import { useEffect } from 'react';
import { NewGroupModal } from './NewGroupModal';
import { DeleteGroupModal } from './DeleteGroupModal';
import { deleteRecordGroup, patchRecordGroup } from '../../utils/serverUtils';
import appconfig from '../../appconfig';
import { useHint } from '../InfrastructureCompo/HintProvider';
import { getMapUrlByMapsId } from '../../utils/map';
import { RecordGroup } from '../../utils/types';

interface P {
  recordGroup: RecordGroup;
  onRecordGroupsInfoUpdate: () => void;
  direction?: 'column' | 'row';
}

export const GroupControlButtonGroup = ({ recordGroup, onRecordGroupsInfoUpdate, direction = 'column' }: P) => {
  const hint = useHint();

  const [showEditModal, setshowEditModal] = useState(false);
  const [showDeleteModal, setshowDeleteModal] = useState(false);

  useEffect(() => {}, []);

  return (
    <div style={{ display: 'flex', flexDirection: direction, gap: '4px' }}>
      {/* EditButton */}
      <button
        title="編集"
        className="singleIcon-button"
        onClick={e => {
          e.stopPropagation();
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
        title="削除"
        className="singleIcon-button"
        onClick={e => {
          e.stopPropagation();
          setshowDeleteModal(true);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
        </svg>
      </button>
      {/* ShareButton */}
      <button
        title="リンクをコピー"
        className="singleIcon-button"
        onClick={e => {
          e.stopPropagation();

          navigator.clipboard
            .writeText(`${appconfig.siteBaseURL}/${getMapUrlByMapsId(recordGroup.mapid)}/${recordGroup.id}`)
            .then(() => hint('bottom', 'この行脚記録のURLをコピーしました！'))
            .catch(err => hint('bottom', 'この行脚記録のURLをｸﾘｯﾌﾟﾎﾞｰﾄにコピーできませんでした！', 'red', 2000));
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
        </svg>
      </button>

      {/* EditModal */}
      <NewGroupModal
        show={showEditModal}
        isEdit={true}
        groupData={recordGroup}
        onClose={() => {
          setshowEditModal(false);
        }}
        onOk={(name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => {
          patchRecordGroup(
            recordGroup.id,
            (data: any) => {
              setshowEditModal(false);
              onRecordGroupsInfoUpdate();
            },
            errmsg => {
              alert(errmsg);
            },
            {
              name,
              desc,
              is_public: Boolean(isPublic),
              show_lived_level: Boolean(showLivedLevel),
            },
          );
        }}
      />
      <DeleteGroupModal
        show={showDeleteModal}
        onClose={() => {
          setshowDeleteModal(false);
        }}
        onOk={() => {
          deleteRecordGroup(
            recordGroup.id,
            data => {
              setshowDeleteModal(false);
              onRecordGroupsInfoUpdate();
            },
            e => {
              alert('削除失敗');
            },
          );
        }}
      />
    </div>
  );
};
