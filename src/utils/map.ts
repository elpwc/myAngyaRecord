export const mapTiles = [
  { id: 'blank', name: '空白背景', url: '' },
  { id: 'default', name: '地図背景', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { id: 'satellite', name: '衛星背景', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
];

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
