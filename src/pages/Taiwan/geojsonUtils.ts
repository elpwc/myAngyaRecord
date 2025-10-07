import countyJson from '../../geojson/taiwan/taiwan_county.geojson';
import townJson from '../../geojson/taiwan/taiwan_town.geojson';
import railwaysJson from '../../geojson/taiwan/taiwan_railways.geojson';
import { getGeoJsonData } from '../../utils/map';
import { TaiwanCounty, TaiwanTown } from './addr';
import { Railway } from '../../utils/mapInfo';

export const getTaiwanTownData = async () => {
  const geojsondata = await getGeoJsonData(townJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.code,
      countyCode: feature.properties.c_code,
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
    } as TaiwanTown;
  });
};

export const getTaiwanCountyData = async () => {
  const geojsondata = await getGeoJsonData(countyJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.code,
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
    } as TaiwanCounty;
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
  return geojsondata.features.map((railwayFeature: any) => {
    return {
      type: railwayFeature.properties.railway,
      lineName: railwayFeature.properties.name,
      coordinates: getRailwayCoordinates(railwayFeature.geometry),
    } as Railway;
  });
};
export const getTaiwanTownInstanceById = (data: TaiwanTown[], id: string): TaiwanTown | undefined => {
  return data.find(town => {
    return town.id === id;
  });
};
