import { RecordStatus } from './map';

export const mapStyles = [
  {
    name: 'classic',
    title: 'クラシック',
    bgcolor: ['white', '#bef7ff', '#50ff50', '#ffa136', '#ff3d3d', '#d646d6', '#8e8e8eff'],
    color: ['black', 'black', 'black', 'black', 'black', 'black', 'black'],
  },
  {
    name: 'default',
    title: 'デフォルト',
    bgcolor: ['white', '#72c4ff', '#43dd43', '#faa429', '#ff3d3d', '#d646d6', '#c5c5c5ff'],
    color: ['black', 'black', 'black', 'black', 'black', 'black', 'black'],
  },
  { name: 'light', title: '淡色', bgcolor: ['white', '#ceeaff', '#a5ffa5', '#ffdf72', '#ff8686', '#ffabff', '#8e8e8eff'], color: ['black', 'black', 'black', 'black', 'black', 'black', 'black'] },
  {
    name: 'dark',
    title: '暗色',
    bgcolor: ['white', '#367099ff', '#298829ff', '#ac772dff', '#974545ff', '#973397ff', '#5a5a5aff'],
    color: ['black', 'white', 'white', 'white', 'white', 'white', 'white'],
  },
  {
    name: 'redgreen',
    title: '緑＆赤',
    bgcolor: ['white', '#8bc34a', '#cddc39', '#ff9800', '#ff5722', '#d64689ff', '#8e8e8eff'],
    color: ['black', 'black', 'black', 'black', 'black', 'black', 'black'],
  },
  {
    name: 'gray',
    title: '灰色',
    bgcolor: ['white', '#cfcfcfff', '#929292ff', '#696969ff', '#363636ff', '#181818ff', '#8e8e8eff'],
    color: ['black', 'black', 'black', 'white', 'white', 'white', 'black'],
  },
  {
    name: 'colorblind',
    title: '色覚異常対応テーマ',
    bgcolor: ['white', 'rgb(100, 143, 255)', 'rgb(120, 94, 240)', 'rgb(255, 176, 0)', 'rgb(254, 97, 0)', 'rgb(220, 38, 127)', '#8e8e8eff'],
    color: ['black', 'black', 'black', 'black', 'black', 'black', 'black'],
  },
];

export const getMapStyleColor = (id: number, status: RecordStatus) => {
  return mapStyles[id].color[status === RecordStatus.Plan ? 6 : status];
};

export const getMapStyleBgColor = (id: number, status: RecordStatus) => {
  return mapStyles[id].bgcolor[status === RecordStatus.Plan ? 6 : status];
};
