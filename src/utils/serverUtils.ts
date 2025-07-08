import { c_uid } from './cookies';
import { mapStyles } from './mapStyles';
import request from './request';
import { RankingResponse, Record } from './types';

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

export const getRanking = async (mapid: string, page: number, amountPerPage: number, onOK: (data: RankingResponse) => void, onError: (msg: string) => void) => {
  return request(`/ranking.php?mapid=${mapid}&page=${page}&amount=${amountPerPage}`, {
    method: 'GET',
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.rankingResponse);
          break;
        default:
          onError(e);
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
