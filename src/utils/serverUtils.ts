import { getPrefIdOfMuniById, getSubPrefNameOfMuniById } from '../pages/Japan/geojsonUtils';
import { Municipality } from './addr';
import { c_uid } from './cookies';
import { mapStyles } from './mapStyles';
import request from './request';
import { Record } from './types';

export const postRecord = async (group_id: number, admin_id: string, level: number, onOK: () => void, onError: (msg: string) => void) => {
  return request('/record.php', {
    method: 'POST',
    data: { group_id: group_id, admin_id, uid: c_uid(), level },
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK();
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const getRecords = async (group_id: number, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/record.php?group_id=${group_id}&uid=${c_uid()}`, {
    method: 'GET',
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.records);
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const getRecordGroups = async (mapid: string, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/recordgroup.php?mapid=${mapid}&uid=${c_uid()}`, {
    method: 'GET',
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.groups);
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const postRecordGroup = async (mapid: string, name: string, desc: string, isPublic: boolean, showLivedLevel: boolean, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/recordgroup.php`, {
    method: 'POST',
    data: { mapid, uid: c_uid(), name, desc, is_public: isPublic, show_lived_level: showLivedLevel },
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.groups);
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const patchRecordGroup = async (
  id: number,
  onOK: (data: any) => void,
  onError: (msg: string) => void,
  data: { name?: string; desc?: string; is_public?: boolean; show_lived_level?: boolean }
) => {
  return request(`/recordgroup.php`, {
    method: 'PATCH',
    data: { ...data, id, uid: c_uid() },
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.groups);
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const deleteRecordGroup = async (id: number, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/recordgroup.php`, {
    method: 'POST',
    data: { id, uid: c_uid() },
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.groups);
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const getFillcolor = (mapStyle: number, records: Record[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[mapStyle].bgcolor[0];
  }
  return mapStyles[mapStyle].bgcolor[records[res].level];
};

export const getForecolor = (mapStyle: number, records: Record[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[mapStyle].color[0];
  }
  return mapStyles[mapStyle].color[records[res].level];
};

export const getTodofukenFillColor = (mapStyle: number, records: Record[], pref_id: number) => {
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

  return mapStyles[mapStyle].bgcolor[maxRecordType];
};

export const getTodofukenForeColor = (mapStyle: number, records: Record[], pref_id: number) => {
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

  return mapStyles[mapStyle].color[maxRecordType];
};

export const getShinkoukyokuFillColor = (
  mapStyle: number,
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

  return mapStyles[mapStyle].bgcolor[maxRecordType];
};

export const getShinkoukyokuForeColor = (
  mapStyle: number,
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

  return mapStyles[mapStyle].color[maxRecordType];
};
