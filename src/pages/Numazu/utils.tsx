import { mapStyles } from '../../utils/mapStyles';
import { Record } from '../../utils/types';
import { Ooaza } from './addr';
import { getOoazaInstanceById } from './geojsonUtils';

export const getAreaFillColor = (mapStyle: number, ooazaList: Ooaza[], records: Record[], area: string) => {
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

  return mapStyles[mapStyle].bgcolor[maxRecordType];
};

export const getAreaForeColor = (mapStyle: number, ooazaList: Ooaza[], records: Record[], area: string) => {
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

  return mapStyles[mapStyle].color[maxRecordType];
};
