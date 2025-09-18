import React from 'react';
import { useEffect } from 'react';
import './index.css';
import defaultAvatar from '../../assets/defaultAvatar.png';
import appconfig from '../../appconfig';

interface P {
  avatarUrl?: string;
  width?: number;
}

export default ({ avatarUrl, width = 120 }: P) => {
  useEffect(() => {}, []);

  return (
    <>
      <img src={avatarUrl ? appconfig.apiBaseURL + '/user' + avatarUrl : defaultAvatar} alt="avatar" className="avatar" style={{ width: `${width}px`, height: `${width}px` }} />
    </>
  );
};
