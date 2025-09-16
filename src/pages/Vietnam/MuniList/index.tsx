import { memo, useState } from 'react';
import './index.css';
import { Record } from '../../../utils/types';
import { TinhVietnam } from '../addr';
import { getCurrentFillColorByRecords, getCurrentForeColorByRecords } from '../../../utils/serverUtils';
import { getStatusByMuniId, getStatusLevelByMuniId } from '../../../utils/map';
import RecordStatusDropdown from '../../../components/RecordStatusDropdown';

interface Props {
  borderData: TinhVietnam[];
  records: Record[];

  onChangeStatus?: (muniId: string, level: number) => void;
}

const MuniList = ({ borderData, records, onChangeStatus }: Props) => {
  return (
    <div className="municipalitiesList">
      <div>
        {borderData.map(tinh => (
          <div key={tinh.id} className="municipalityItem">
            <div className="municipalityName">{tinh.hantu}</div>
            <RecordStatusDropdown
              value={getStatusLevelByMuniId(tinh.id, records)}
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
