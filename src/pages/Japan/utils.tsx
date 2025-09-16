import { getCurrentFillColorByLevel, getCurrentForeColorByLevel } from '../../utils/serverUtils';
import { Record } from '../../utils/types';
import { Municipality } from './addr';
import { getPrefIdOfMuniById, getSubPrefNameOfMuniById } from './geojsonUtils';

export const getTodofukenFillColor = (records: Record[], pref_id: string) => {
  let maxRecordType = 0;
  for (let i = 0; i < records.length; i++) {
    if (getPrefIdOfMuniById(records[i].admin_id) === pref_id) {
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

export const getTodofukenForeColor = (records: Record[], pref_id: string) => {
  let maxRecordType = 0;
  for (let i = 0; i < records.length; i++) {
    if (getPrefIdOfMuniById(records[i].admin_id) === pref_id) {
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

export const getShinkoukyokuFillColor = (
  records: Record[],
  munidata: {
    prefecture: string;
    municipalities: Municipality[];
  }[],
  subpref: string
) => {
  let maxRecordType = 0;

  for (let i = 0; i < records.length; i++) {
    if (getSubPrefNameOfMuniById(munidata, records[i].admin_id) === subpref) {
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

export const getShinkoukyokuForeColor = (
  records: Record[],
  munidata: {
    prefecture: string;
    municipalities: Municipality[];
  }[],
  subpref: string
) => {
  let maxRecordType = 0;
  for (let i = 0; i < records.length; i++) {
    if (getSubPrefNameOfMuniById(munidata, records[i].admin_id) === subpref) {
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
