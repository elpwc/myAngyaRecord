import React from 'react';
import { useEffect } from 'react';
import './index.css';
import { getAvatarFullURL } from '../../utils/userUtils';

interface P {
  avatarUrl?: string;
  width?: number;
}

export default ({ avatarUrl, width = 120 }: P) => {
  useEffect(() => {}, []);

  return (
    <>
      <img src={getAvatarFullURL (avatarUrl)} alt="avatar" className="avatar" style={{ width: `${width}px`, height: `${width}px` }} />
    </>
  );
};
