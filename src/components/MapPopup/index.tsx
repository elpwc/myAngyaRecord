import React from 'react';
import { useEffect } from 'react';
import './index.css';
import { useMap } from 'react-leaflet';

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
      <p className="popupaddr" style={{ margin: 0 }}>
        {addr}
      </p>
      <p className="popuptitle" style={{ margin: 0 }}>
        {name}
      </p>

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
    </div>
  );
};
