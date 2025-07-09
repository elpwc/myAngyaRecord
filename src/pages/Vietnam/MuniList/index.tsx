import { memo, useState } from 'react';
import { chihous_data } from '../../../utils/map';
import './index.css';
import { Record } from '../../../utils/types';
import { getFillcolor, getForecolor } from '../../../utils/serverUtils';
import { mapStyles } from '../../../utils/mapStyles';
import { TinhVietnam } from '../addr';

interface Props {
  borderData: TinhVietnam[];
  records: Record[];
  currentMapStyle?: number;
}

const getStatusTextByLevel = (level: number): string => {
  switch (level) {
    case 5:
      return '居住';
    case 4:
      return '宿泊';
    case 3:
      return '訪問';
    case 2:
      return '接地';
    case 1:
      return '通過';
    case 0:
      return '未踏';
    default:
      return '未踏';
  }
};

const getStatusByMuniId = (muniId: string, records: Record[]): string => {
  const record = records.find(r => r.admin_id === muniId);
  return record ? getStatusTextByLevel(record.level) : '未踏';
};

const MuniList = ({ borderData, records, currentMapStyle = 0 }: Props) => {
  return (
    <div className="municipalitiesList">
      <div>
        {borderData.map(tinh => (
          <div key={tinh.id} className="municipalityItem">
            <div className="municipalityName">{tinh.hantu}</div>
            <div className="municipalityStatus" style={{ backgroundColor: getFillcolor(currentMapStyle, records, tinh.id), color: getForecolor(currentMapStyle, records, tinh.id) }}>
              {getStatusByMuniId(tinh.id, records)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(MuniList);
