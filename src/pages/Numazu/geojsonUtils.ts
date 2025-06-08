import prefJson from '../../geojson/numazu/numazu.geojson';
import { Prefecture } from '../../utils/addr';
import { getGeoJsonData } from '../../utils/map';


export const getNumazuOoazaData = async () => {
  const geojsondata = await getGeoJsonData(prefJson);
  return geojsondata.features.map((feature: any) => {
    return {
      id: feature.properties.ADDRCODE,
      name: feature.properties.ONAME,
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
