import { c_uid } from './cookies';
import { getGlobalState } from './globalStore';
import { mapStyles } from './mapStyles';
import request from './request';
import { RankingResponse, Record } from './types';

export const postRecord = async (group_id: number, admin_id: string, level: number, comment: string, onOK: () => void, onError: (msg: string) => void) => {
  return request('/record.php', {
    method: 'POST',
    data: { group_id: group_id, admin_id, uid: c_uid(), level, comment },
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
  return request(`/record.php?group_id=${group_id}`, {
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

export const patchRecord = async (id: number, data: { level?: number; comment?: string }, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/record.php`, {
    method: 'PATCH',
    data: { ...data, id, uid: c_uid() },
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

export const getRecordGroupById = async (id: number, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/recordgroup.php?id=${id}`, {
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

export const getUserInfoById = async (id: number, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/user/user.php?id=${id}`, {
    method: 'GET',
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.user);
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

export const getUserRecordsById = async (id: number, isPublic: boolean, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/recordGroup.php?uid=${id}&is_public=${isPublic}`, {
    method: 'GET',
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.user);
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

export const updateUserInfo = async (id: number, data: { name?: string; hitokoto?: string }, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/user/user.php`, {
    method: 'PATCH',
    data: { ...data, id },
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.user);
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

export const updateUserAvatar = async (id: number, avatarFile: File, onOK: (data: any) => void, onError: (msg: string) => void) => {
  const formData = new FormData();
  formData.append('id', String(id));
  formData.append('avatar', avatarFile);

  return request(`/user/avatar.php`, {
    method: 'POST',
    data: formData,
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.user);
          break;
        default:
          onError(e.res);
          break;
      }
    })
    .catch(e => {
      console.error('Avatar upload failed:', e);
      onError('network_error');
    });
};

export const updateUserPassword = async (id: number, oldPassword: string, newPassword: string, onOK: (data: any) => void, onError: (msg: string) => void) => {
  return request(`/user/user.php`, {
    method: 'PATCH',
    data: { id, old_password: oldPassword, new_password: newPassword },
  })
    .then(e => {
      switch (e.res) {
        case 'ok':
          onOK(e.user);
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

// 给出自治体id，当前地图颜色主题和Record列表，返回这个自治体在这个Record列表中的颜色
export const getFillcolorByRecords = (mapStyle: number, records: Record[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[mapStyle].bgcolor[0];
  }
  return mapStyles[mapStyle].bgcolor[records[res].level];
};

// 给出自治体id，当前地图颜色主题和Record列表，返回这个自治体在这个Record列表中的颜色
export const getForecolorByRecords = (mapStyle: number, records: Record[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[mapStyle].color[0];
  }
  return mapStyles[mapStyle].color[records[res].level];
};

// 给出自治体id，和Record列表，返回这个自治体在这个Record列表中的当前主题的颜色
export const getCurrentFillColorByRecords = (records: Record[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[getGlobalState().mapStyle].bgcolor[0];
  }
  return mapStyles[getGlobalState().mapStyle].bgcolor[records[res].level];
};

// 给出自治体id，和Record列表，返回这个自治体在这个Record列表中的当前主题的颜色
export const getCurrentForeColorByRecords = (records: Record[], admin_id: string) => {
  const res = records.findIndex(record => {
    return record.admin_id === admin_id;
  });
  if (res === -1) {
    return mapStyles[getGlobalState().mapStyle].color[0];
  }
  return mapStyles[getGlobalState().mapStyle].color[records[res].level];
};

// 给出行脚level，返回当前主题的颜色
export const getCurrentFillColorByLevel = (level: number) => {
  return mapStyles[getGlobalState().mapStyle].bgcolor[level];
};

// 给出行脚level，返回当前主题的颜色
export const getCurrentForeColorByLevel = (level: number) => {
  return mapStyles[getGlobalState().mapStyle].color[level];
};
