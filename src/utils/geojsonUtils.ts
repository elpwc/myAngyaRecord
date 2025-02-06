import prefJson from '../geojson/japan/prefectures.geojson';
import shinkoukyokuJson from '../geojson/japan/hokkaido-branch.geojson';
import railwaysJson from '../geojson/japan/railways.geojson';
import { Municipality, Prefecture, Railway } from './addr';
import { allPrefJsons } from './geojsonReader';

const getGeoJsonData = async (url: string) => {
  return await fetch(url).then(response => response.json());
};

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
