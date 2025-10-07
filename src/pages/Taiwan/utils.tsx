import { getCurrentFillColorByLevel, getCurrentForeColorByLevel } from '../../utils/serverUtils';
import { Record } from '../../utils/types';
import { TaiwanTown } from './addr';
import { getTaiwanTownInstanceById } from './geojsonUtils';

export const getAreaFillColor = (townList: TaiwanTown[], records: Record[], countyCode: string) => {
  let maxRecordType = 0;

  for (let i = 0; i < records.length; i++) {
    const town = getTaiwanTownInstanceById(townList, records[i].admin_id);
    if (town !== undefined && town.countyCode === countyCode) {
      if (records[i].level > maxRecordType) {
        maxRecordType = records[i].level;
        if (records[i].level === 5) {
          break;
        }
      }
    }
  }

  return getCurrentFillColorByLevel(maxRecordType);
};

export const getAreaForeColor = (townList: TaiwanTown[], records: Record[], countyCode: string) => {
  let maxRecordType = 0;

  for (let i = 0; i < records.length; i++) {
    const town = getTaiwanTownInstanceById(townList, records[i].admin_id);
    if (town !== undefined && town.countyCode === countyCode) {
      if (records[i].level > maxRecordType) {
        maxRecordType = records[i].level;
        if (records[i].level === 5) {
          break;
        }
      }
    }
  }

  return getCurrentForeColorByLevel(maxRecordType);
};
