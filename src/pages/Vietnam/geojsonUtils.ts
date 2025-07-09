import tinhVietnamJson from '../../geojson/vietnam/diaphantinhvn.geojson';
import { getGeoJsonData } from '../../utils/map';
import { TinhVietnam } from './addr';

export const getTinhVietnamData = async () => {
  const geojsondata = await getGeoJsonData(tinhVietnamJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.code,
      type: feature.properties.type,
      hantu: feature.properties.hantu,
      ja: feature.properties.ja,
      zhcn: feature.properties.zhcn,
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
    } as TinhVietnam;
  });
};

export const getTinhInstanceById = (tinhData: TinhVietnam[], id: string): TinhVietnam | undefined => {
  return tinhData.find(tinh => {
    return tinh.id === id;
  });
};
