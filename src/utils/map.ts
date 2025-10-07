import { LatLngTuple } from 'leaflet';
import { Record } from './types';

export const getGeoJsonData = async (url: string) => {
  return await fetch(url).then(response => response.json());
};

export enum MapsId {
  JapanMuni = 'japanmuni',
  Numazu = 'numazu',
  Vietnam = 'vietnam',
  Hongkong = 'hongkong',
  Taiwan = 'taiwan',
}

export const getMapTitleByMapsId = (mapsId: MapsId) => {
  switch (mapsId) {
    case MapsId.JapanMuni:
      return '日本市町村';
    case MapsId.Numazu:
      return '沼津市';
    case MapsId.Vietnam:
      return 'ベトナム';
    case MapsId.Hongkong:
      return '香港';
    case MapsId.Taiwan:
      return '台湾';
    default:
      return '';
  }
};

export const getMapUrlByMapsId = (mapsId: MapsId) => {
  switch (mapsId) {
    case MapsId.JapanMuni:
      return 'japan';
    case MapsId.Numazu:
      return 'numazu';
    case MapsId.Vietnam:
      return 'vietnam';
    case MapsId.Hongkong:
      return 'hongkong';
    case MapsId.Taiwan:
      return 'taiwan';
    default:
      return '';
  }
};

export const mapTiles = [
  { id: 'blank', name: '白地図', url: '' },
  { id: 'default', name: '道路地図', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { id: 'satellite', name: '写真', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
];

export enum RecordStatus {
  Live = 5,
  Stay = 4,
  Walk = 3,
  Stand = 2,
  Pass = 1,
  None = 0,
  // -1 是 undefined 佔位符
  Plan = -2,
}

export const maxRecordStatus = (status1: RecordStatus, status2: RecordStatus): RecordStatus => {
  if (status1 > status2) {
    return status1;
  }
  return status2;
};

export const recordStatus: { name: string; value: RecordStatus; point: number; desc: string }[] = [
  { name: '居住', value: RecordStatus.Live, point: 5, desc: '住民票持ちもしくは連続１ヶ月以上住んだ場所' },
  { name: '宿泊', value: RecordStatus.Stay, point: 4, desc: '泊ったことある場所' },
  { name: '訪問', value: RecordStatus.Walk, point: 3, desc: '歩いた・遊んだ場所' },
  { name: '接地', value: RecordStatus.Stand, point: 2, desc: '乗り換えで歩いた場所' },
  { name: '通過', value: RecordStatus.Pass, point: 1, desc: '車から降りてなかった場所' },
  { name: '未踏', value: RecordStatus.None, point: 0, desc: '行ったことない場所' },
  { name: '計画', value: RecordStatus.Plan, point: 0, desc: '行こうと思っている場所' },
];

export const getStatusByLevel = (level: number): RecordStatus => {
  switch (level) {
    case 5:
      return RecordStatus.Live;
    case 4:
      return RecordStatus.Stay;
    case 3:
      return RecordStatus.Walk;
    case 2:
      return RecordStatus.Stand;
    case 1:
      return RecordStatus.Pass;
    case 0:
      return RecordStatus.None;
    case -2:
      return RecordStatus.Plan;
    default:
      return RecordStatus.None;
  }
};

export const getStatusByMuniId = (muniId: string, records: Record[]): RecordStatus => {
  const record = records.find(r => r.admin_id === muniId);
  return record ? getStatusByLevel(record.level) : RecordStatus.None;
};

export const getStatusLevelByMuniId = (muniId: string, records: Record[]): number => {
  const record = records.find(r => r.admin_id === muniId);
  return record ? record.level : 0;
};

export const chihous_data = [
  {
    name: '北海道地方',
    pref: ['北海道'],
    color: '#4dd35b',
  },
  {
    name: '東北地方',
    pref: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    color: '#13c497',
  },
  {
    name: '関東地方',
    pref: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    color: '#00A040',
  },
  {
    name: '中部地方',
    pref: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    color: '#F15A22',
  },
  {
    name: '近畿地方',
    pref: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    color: '#00B2E3',
  },
  {
    name: '中国地方',
    pref: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    color: '#3d80d3',
  },
  {
    name: '四国地方',
    pref: ['徳島県', '香川県', '愛媛県', '高知県'],
    color: '#06daff',
  },
  {
    name: '九州地方',
    pref: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
    color: '#e53d4a',
  },
  {
    name: '沖縄地方',
    pref: ['沖縄県'],
    color: '#C8A01D',
  },
];

const getTheLargestPolygon = (coordinates: [number, number][][]) => {
  return coordinates.reduce((largest, current) => {
    const currentArea = Math.abs(
      current.reduce((area, coord, index) => {
        const nextCoord = current[(index + 1) % current.length];
        return area + coord[0] * nextCoord[1] - nextCoord[0] * coord[1];
      }, 0) / 2
    );
    const largestArea = Math.abs(
      largest.reduce((area, coord, index) => {
        const nextCoord = largest[(index + 1) % largest.length];
        return area + coord[0] * nextCoord[1] - nextCoord[0] * coord[1];
      }, 0) / 2
    );
    return currentArea > largestArea ? current : largest;
  }, coordinates[0]);
};

/**
 * NOT USED
 */
// 计算多边形的中心点
export const getBounds = (coordinates: [number, number][][]) => {
  const bounds = getTheLargestPolygon(coordinates).reduce(
    (bounds, coord) => {
      return [
        [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
        [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
      ];
    },
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ]
  );

  return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2] as LatLngTuple;
};

export const getLabelPosition = (labelPos: [number, number], label: string, currentZoom: number) => {
  return [labelPos[0], labelPos[1] + ((label.length * 0.2) / 13) * (18 - currentZoom)];
};
