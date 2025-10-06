import prefJson from '../../geojson/japan/prefectures.geojson';
import shinkoukyokuJson from '../../geojson/japan/hokkaido-subpref.geojson';
import railwaysJson from '../../geojson/japan/railways.geojson';
import { allPrefJsons } from './geojsonReader';
import { getGeoJsonData } from '../../utils/map';
import { JapanRailway, Municipality, Prefecture } from './addr';
import turf from 'turf';

// 使用truf.js的union()实时计算都道府县边界测试（2025-10-07）
// 遅すぎるﾝｺﾞ...ページ切り替えるたびに3秒ほど固まっちゃう
export const todofuken_union_test = async () => {
  return allPrefJsons.map((todofuken, index) => {
    let merged = todofuken[2].features[0];
    for (let i = 1; i < todofuken[2].features.length; i++) {
      const result = turf.union(merged, todofuken[2].features[i]);
      if (result) merged = result;
    }
    return {
      id: index.toString(),
      name: merged.properties.N03_001,
      coordinates: merged.geometry.coordinates.map((area: any) => {
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
      labelPos: [merged.properties.label_point[1], merged.properties.label_point[0]],
    } as Prefecture;
  });
};

/**
 * 解析都道府县或者北海道振兴局数据
 * @returns any
 */
export const getPrefecture_ShinkoukyokuData = async (shinkoukyoku: boolean = false) => {
  const geojsondata = await getGeoJsonData(shinkoukyoku ? shinkoukyokuJson : prefJson);
  return geojsondata.features.map((feature: any, index: number) => {
    return {
      id: index.toString(),
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
      labelPos: [feature.properties.label_point[1], feature.properties.label_point[0]],
    } as Prefecture;
  });
};

/**
 * 获取市区町村数据
 * @returns any
 */
export const getMunicipalitiesData = async (): Promise<
  {
    prefecture: string;
    municipalities: Municipality[];
  }[]
> => {
  return allPrefJsons.map(prefjsondata => {
    return {
      prefecture: prefjsondata[0],
      municipalities: prefjsondata[2].features
        .map((feature: any) => {
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
            labelPos: [feature.properties.label_point[1], feature.properties.label_point[0]],
          } as Municipality;
        })
        .filter((muni: Municipality) => {
          // 所属未定地を排除
          return muni.id !== null;
        }),
    };
  });
};

export const getRailwaysData = async () => {
  const getRailwayCoordinates = (geometry: any) => {
    const coordinates = geometry.coordinates;
    switch (geometry.type) {
      case 'LineString':
        return coordinates.map((point: [number, number]) => {
          return [point[1], point[0]];
        });
      case 'MultiLineString':
        return coordinates.map((line: [number, number][]) => {
          return line.map((point: [number, number]) => {
            return [point[1], point[0]];
          });
        });
      default:
        return [];
    }
  };

  const geojsondata = await getGeoJsonData(railwaysJson);
  return geojsondata.features.map((railwayCompanyFeature: any) => {
    return {
      railwayClassCd: railwayCompanyFeature.properties.r,
      institutionTypeCd: railwayCompanyFeature.properties.t,
      lineName: railwayCompanyFeature.properties.l,
      companyName: railwayCompanyFeature.properties.c,
      coordinates: getRailwayCoordinates(railwayCompanyFeature.geometry),
    } as JapanRailway;
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

export const getPrefIdOfMuniById = (muniId: string): string => {
  return (Number(muniId.substring(0, 2)) - 1).toString();
};

export const getPrefNameOfMuniById = (muniId: string): string => {
  return TODOFUKEN_LIST[Number(getPrefIdOfMuniById(muniId))];
};

export const getSubPrefNameOfMuniById = (
  munidata: {
    prefecture: string;
    municipalities: Municipality[];
  }[],
  muniId: string
): string => {
  const resMuni = munidata
    .find(pref => {
      return pref.prefecture === '北海道';
    })!
    .municipalities.find((muni: Municipality) => {
      return muni.id === muniId;
    });

  if (resMuni?.shinkoukyoku) {
    return resMuni.shinkoukyoku;
  }

  return '';
};
