import prefJson from '../../geojson/japan/prefectures.geojson';
import shinkoukyokuJson from '../../geojson/japan/hokkaido-branch.geojson';
import railwaysJson from '../../geojson/japan/railways.geojson';
import { Municipality, Prefecture, Railway } from '../../utils/addr';
import { allPrefJsons } from './geojsonReader';
import { getGeoJsonData } from '../../utils/map';

/**
 * 解析都道府县或者北海道振兴局数据
 * @returns any
 */
export const getPrefecture_ShinkoukyokuData = async (shinkoukyoku: boolean = false) => {
  const geojsondata = await getGeoJsonData(shinkoukyoku ? shinkoukyokuJson : prefJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.name,
      name: feature.properties.name,
      coordinates: feature.geometry.coordinates.map((area: any) => {
        if (typeof area[0][0] === 'number') {
          // 只有一个polygon
          return area.map((point: any) => {
            return [point[1], point[0]];
          });
        }
        // 有多个polygon
        return area[0].map((point: any) => {
          return [point[1], point[0]];
        });
      }),
    } as Prefecture;
  });
};

/**
 * 获取市区町村数据
 * @returns any
 */
export const getMunicipalitiesData = async () => {
  return allPrefJsons.map(prefjsondata => {
    return {
      prefecture: prefjsondata[0],
      municipalities: prefjsondata[2].features.map((feature: any) => {
        const pref = feature.properties.N03_001;
        const shinkoukyoku = feature.properties.N03_002;
        const gun_seireishi = feature.properties.N03_003;
        const shichosonku_name = feature.properties.N03_004;
        const id = feature.properties.N03_007;
        // 政令市
        let is_special_city_ward = false;
        if (gun_seireishi !== null) {
          if (gun_seireishi.length > 1) {
            if (gun_seireishi.substr(-1) === '市') {
              is_special_city_ward = true;
            }
          }
        }
        return {
          id,
          pref,
          shinkoukyoku,
          gun_seireishi,
          name: shichosonku_name,
          name_kana: '',
          is_special_city_ward,
          coordinates: feature.geometry.coordinates.map((area: any) => {
            if (typeof area[0][0] === 'number') {
              // 只有一个polygon
              return area.map((point: any) => {
                return [point[1], point[0]];
              });
            }
            // 有多个polygon
            return area[0].map((point: any) => {
              return [point[1], point[0]];
            });
          }),
        } as Municipality;
      }),
    };
  });
};

export const getRailwaysData = async () => {
  const geojsondata = await getGeoJsonData(railwaysJson);
  return geojsondata.features.map((railwayCompanyFeature: any) => {
    return {
      companyName: railwayCompanyFeature.properties.name,
      isJR: railwayCompanyFeature.properties.name.includes('旅客'),
      coordinates: railwayCompanyFeature.geometry.coordinates.map((area: any) => {
        if (typeof area[0][0] === 'number') {
          // 只有一个polygon
          return area.map((point: any) => {
            return [point[1], point[0]];
          });
        }
        // 有多个polygon
        return area[0].map((point: any) => {
          return [point[1], point[0]];
        });
      }),
    } as Railway;
  });
};

export const TODOFUKEN_LIST = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

export const getPrefOfMuniById = (muniId: string) => {
  return TODOFUKEN_LIST[Number(muniId.substring(0, 2))];
};
