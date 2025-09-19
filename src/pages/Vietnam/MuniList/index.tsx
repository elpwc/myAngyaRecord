import { memo, useState } from 'react';
import './index.css';
import { Record } from '../../../utils/types';
import { TinhVietnam } from '../addr';
import { getStatusLevelByMuniId } from '../../../utils/map';
import RecordStatusDropdown from '../../../components/RecordStatusDropdown';
import { isLogin } from '../../../utils/userUtils';

interface Props {
  borderData: TinhVietnam[];
  records: Record[];
  isViewMode: boolean;
  onChangeStatus?: (muniId: string, level: number) => void;
}

const MuniList = ({ borderData, records, isViewMode, onChangeStatus }: Props) => {
  return (
    <div className="municipalitiesList">
      <div>
        {borderData.map(tinh => (
          <div key={tinh.id} className="municipalityItem">
            <div className="municipalityName">{tinh.hantu}</div>
            <RecordStatusDropdown
              value={getStatusLevelByMuniId(tinh.id, records)}
              disabled={isViewMode || !isLogin()}
              onChange={(value: number) => {
                onChangeStatus?.(tinh.id, Number(value));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(MuniList);
