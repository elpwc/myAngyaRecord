import React from 'react';
import { useEffect } from 'react';
import './index.css';
import { useMap } from 'react-leaflet';
import { isLogin } from '../../utils/userUtils';
import { recordStatus } from '../../utils/map';
import { getCurrentFillColorByLevel, getCurrentForeColorByLevel, patchRecord, postRecord } from '../../utils/serverUtils';
import { useHint } from '../HintProvider';

interface P {
  addr: string;
  name: string;
  comment: string;
  /* 用来上传comment，不一定有 */
  recordId?: number;
  /* 記録がないと記録できない */
  hasOpenningRecordGroup: boolean;
  groupId: number;
  adminId: string;
  selected: number;
  onClick: (value: number) => void;
}

export default ({ addr, name, comment, recordId, hasOpenningRecordGroup, groupId, adminId, selected, onClick }: P) => {
  const thisMap = useMap();
  const hint = useHint();

  const [editCommentMode, setEditCommentMode] = React.useState(false);
  const [editingComment, setEditingComment] = React.useState(comment);

  return (
    <div className="popup">
      <div className="popuptitleContainer">
        <p className="popupaddr" style={{ margin: 0 }}>
          {addr}
        </p>
        <p className="popuptitle" style={{ margin: 0 }}>
          <span>{name}</span>
          <a href={'https://ja.wikipedia.org/wiki/' + name} target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.835 3.003c.828-.006 2.688 0 2.688 0l.033.03v.288q0 .12-.133.12c-.433.02-.522.063-.68.29-.087.126-.258.393-.435.694l-1.52 2.843-.043.089 1.858 3.801.113.031 2.926-6.946q.152-.42-.044-.595c-.132-.114-.224-.18-.563-.195l-.275-.014a.16.16 0 0 1-.096-.035.1.1 0 0 1-.046-.084v-.289l.042-.03h3.306l.034.03v.29q0 .117-.133.117-.65.03-.962.281a1.64 1.64 0 0 0-.488.704s-2.691 6.16-3.612 8.208c-.353.672-.7.61-1.004-.019A224 224 0 0 1 8.044 8.81c-.623 1.285-1.475 3.026-1.898 3.81-.411.715-.75.622-1.02.019-.45-1.065-1.131-2.519-1.817-3.982-.735-1.569-1.475-3.149-1.943-4.272-.167-.4-.293-.657-.412-.759q-.18-.15-.746-.18Q0 3.421 0 3.341v-.303l.034-.03c.615-.003 3.594 0 3.594 0l.034.03v.288q0 .119-.15.118l-.375.016q-.483.02-.483.288-.002.125.109.4c.72 1.753 3.207 6.998 3.207 6.998l.091.023 1.603-3.197-.32-.71L6.24 5.095s-.213-.433-.286-.577l-.098-.196c-.387-.77-.411-.82-.865-.88-.137-.017-.208-.035-.208-.102v-.304l.041-.03h2.853l.075.024v.303q0 .104-.15.104l-.206.03c-.523.04-.438.254-.09.946l1.057 2.163 1.17-2.332c.195-.427.155-.534.074-.633-.046-.055-.202-.144-.54-.158l-.133-.015a.16.16 0 0 1-.096-.034.1.1 0 0 1-.045-.085v-.288l.041-.03Z" />
            </svg>
          </a>
        </p>

        <div className="flex">
          <button
            className="mappopup-comment-button flex"
            onClick={() => {
              if (isLogin()) {
                setEditCommentMode(!editCommentMode);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
              <path
                fillRule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
              />
            </svg>
            <span>{editCommentMode ? 'キャンセル' : 'コメント追加'}</span>
          </button>
          {editCommentMode && (
            <button
              className="mappopup-comment-button flex"
              onClick={() => {
                if (isLogin()) {
                  if (recordId) {
                    patchRecord(
                      recordId,
                      { comment: editingComment ?? '' },
                      () => {
                        hint('bottom', 'コメントを更新しました');
                        setEditingComment(editingComment);
                        setEditCommentMode(false);
                      },
                      () => {
                        hint('bottom', 'コメントの更新に失敗しました');
                      }
                    );
                  } else {
                    // 沒有recordId的情况，需要建立一个空白的记录
                    postRecord(
                      groupId,
                      adminId,
                      0,
                      editingComment ?? '',
                      () => {
                        hint('bottom', 'コメントを更新しました');
                        setEditingComment(editingComment);
                        setEditCommentMode(false);
                      },
                      () => {
                        hint('bottom', 'コメントの追加に失敗しました');
                      }
                    );
                  }
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 2H9v3h2z" />
                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
              </svg>
              <span>保存する</span>
            </button>
          )}
        </div>

        {editCommentMode ? (
          <textarea className="mappopup-comment-textarea" placeholder="コメントを記入..." onChange={e => setEditingComment(e.target.value)}>
            {editingComment}
          </textarea>
        ) : (
          <p className="popupcomment">{editingComment || ''}</p>
        )}
      </div>
      <div className="popupbuttoncontainer">
        {recordStatus.map(value => {
          return (
            <button
              key={value.name}
              className={'popupbutton' + (selected === value.value ? ' popupbutton-selected' : '')}
              onClick={() => {
                if (isLogin()) {
                  if (hasOpenningRecordGroup) {
                    // 記録がある場合のみ処理を続行
                    onClick(value.value);
                  } else {
                    alert('まず記録を開くか・作成してください');
                  }
                } else {
                  alert('まずログインしてから記録してください');
                }
                thisMap.closePopup();
              }}
              style={{ backgroundColor: getCurrentFillColorByLevel(value.value), color: getCurrentForeColorByLevel(value.value) }}
            >
              {value.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
