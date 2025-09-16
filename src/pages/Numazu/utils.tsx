import { getCurrentFillColorByLevel, getCurrentForeColorByLevel } from '../../utils/serverUtils';
import { Record } from '../../utils/types';
import { Ooaza } from './addr';
import { getOoazaInstanceById } from './geojsonUtils';

export const getAreaFillColor = (ooazaList: Ooaza[], records: Record[], area: string) => {
  let maxRecordType = 0;

  for (let i = 0; i < records.length; i++) {
    const ooaza = getOoazaInstanceById(ooazaList, records[i].admin_id);
    if (ooaza !== undefined && ooaza.area === area) {
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

export const getAreaForeColor = (ooazaList: Ooaza[], records: Record[], area: string) => {
  let maxRecordType = 0;

  for (let i = 0; i < records.length; i++) {
    const ooaza = getOoazaInstanceById(ooazaList, records[i].admin_id);
    if (ooaza !== undefined && ooaza.area === area) {
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
