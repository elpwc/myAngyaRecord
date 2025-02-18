import React from 'react';
import { useEffect } from 'react';
import './index.css';

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
  useEffect(() => {}, []);

  return (
    <div className="popup">
      <p className="popupaddr" style={{ margin: 0 }}>
        {addr}
      </p>
      <p className="popuptitle" style={{ margin: 0 }}>
        {name}
      </p>

      <div className="popupbuttoncontainer">
        <button
          className="popupbutton"
          onClick={() => {
            onClick(5);
          }}
          style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[0], color: mapStyles[currentMapStyle].color[0] }}
        >
          居住
        </button>
        <button
          className="popupbutton"
          onClick={() => {
            onClick(4);
          }}
          style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[1], color: mapStyles[currentMapStyle].color[1] }}
        >
          宿泊
        </button>
        <button
          className="popupbutton"
          onClick={() => {
            onClick(3);
          }}
          style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[2], color: mapStyles[currentMapStyle].color[2] }}
        >
          訪問
        </button>
        <button
          className="popupbutton"
          onClick={() => {
            onClick(2);
          }}
          style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[3], color: mapStyles[currentMapStyle].color[3] }}
        >
          接地
        </button>
        <button
          className="popupbutton"
          onClick={() => {
            onClick(1);
          }}
          style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[4], color: mapStyles[currentMapStyle].color[4] }}
        >
          通過
        </button>
        <button
          className="popupbutton"
          onClick={() => {
            onClick(0);
          }}
          style={{ backgroundColor: mapStyles[currentMapStyle].bgcolor[5], color: mapStyles[currentMapStyle].color[5] }}
        >
          未踏
        </button>
      </div>
    </div>
  );
};
