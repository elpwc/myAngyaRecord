import HongkongJson from '../../geojson/hongkong/hksar_district.geojson';
import vietnamRailwaysJson from '../../geojson/hongkong/hkrailway.geojson';
import { getGeoJsonData } from '../../utils/map';
import { HongkongDistrict, HongkongRailway } from './addr';

export const getMuniBorderData = async () => {
  const geojsondata = await getGeoJsonData(HongkongJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.id,
      en: feature.properties.en,
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
    } as HongkongDistrict;
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

  const geojsondata = await getGeoJsonData(vietnamRailwaysJson);
  return geojsondata.features.map((railwayFeature: any) => {
    return {
      type: railwayFeature.properties.railway,
      lineName: railwayFeature.properties.name,
      lineNameEn: railwayFeature.properties.nameen,
      coordinates: getRailwayCoordinates(railwayFeature.geometry),
    } as HongkongRailway;
  });
};

export const getMuniInstanceById = (muniData: HongkongDistrict[], id: string): HongkongDistrict | undefined => {
  return muniData.find(muni => {
    return muni.id === id;
  });
};
