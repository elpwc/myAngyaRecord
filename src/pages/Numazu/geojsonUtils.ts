import ooazaJson from '../../geojson/numazu/numazu-oaza.geojson';
import areaJson from '../../geojson/numazu/numazu-area.geojson';
import { getGeoJsonData } from '../../utils/map';
import { Ooaza, OoazaArea } from './addr';

export const getNumazuOoazaData = async () => {
  const geojsondata = await getGeoJsonData(ooazaJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.code,
      area: feature.properties.area,
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
    } as Ooaza;
  });
};

export const getNumazuAreaData = async () => {
  const geojsondata = await getGeoJsonData(areaJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.code,
      name: feature.properties.area,
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
    } as OoazaArea;
  });
};

export const getOoazaInstanceById = (ooazaData: Ooaza[], id: string): Ooaza | undefined => {
  return ooazaData.find(ooaza => {
    return ooaza.id === id;
  });
};
