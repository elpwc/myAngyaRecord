import React from 'react';
import { useEffect } from 'react';
import './index.css';
import { useMap } from 'react-leaflet';
import { isLogin } from '../../utils/userUtils';

interface P {
  addr: string;
  name: string;
  onClick: (value: number) => void;
}
const mapStyles = [
  { name: 'classic', bgcolor: ['#d646d6', '#ff3d3d', '#ffa136', '#50ff50', '#bef7ff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
  { name: 'light', bgcolor: ['#ffabff', '#ff8686', '#ffdf72', '#a5ffa5', '#ceeaff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
  { name: 'dark', bgcolor: ['#d646d6', '#ff3d3d', '#faa429', '#43dd43', '#72c4ff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
];

let currentMapStyle = 2;

export default ({ addr, name, onClick }: P) => {
  const thisMap = useMap();

  const values = [
    { name: '居住', value: 5, desc: '' },
    { name: '宿泊', value: 4, desc: '' },
    { name: '訪問', value: 3, desc: '' },
    { name: '接地', value: 2, desc: '' },
    { name: '通過', value: 1, desc: '' },
    { name: '未踏', value: 0, desc: '' },
  ];

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
      </div>
      {isLogin() ? (
        <div className="popupbuttoncontainer">
          {values.map(value => {
            return (
              <button
                key={value.name}
                className="popupbutton"
                onClick={() => {
                  onClick(value.value);
                  thisMap.closePopup();
                }}
                style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[5 - value.value], color: mapStyles[currentMapStyle].color[5 - value.value] }}
              >
                {value.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p style={{ width: '100%', textAlign: 'center', margin: '6px 0' }}>ログインして記録してください</p>
      )}
    </div>
  );
};
