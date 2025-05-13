import { c_uid } from './cookies';
import { mapStyles } from './mapStyles';
import request from './request';

export const postRecord = async (mapid: string, admin_id: string, level: number, onOK: () => void, onError: (msg: string) => void) => {
  return request('/record.php', {
    method: 'POST',
    data: { mapid: mapid, admin_id, uid: c_uid(), level },
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

export const getRecords = async (mapid: string, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/record.php?mapid=${mapid}&uid=${c_uid()}`, {
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

export const getFillcolor = (records: any[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[0].bgcolor[0];
  }
  return mapStyles[0].bgcolor[records[res].level];
};

export const getForecolor = (records: any[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[0].color[0];
  }
  return mapStyles[0].color[records[res].level];
};
