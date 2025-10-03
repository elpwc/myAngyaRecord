import { memo, useState } from 'react';
import './index.css';
import { Record } from '../../../utils/types';
import { getStatusLevelByMuniId } from '../../../utils/map';
import RecordStatusDropdown from '../../../components/AppCompo/RecordStatusDropdown';
import { isLogin } from '../../../utils/userUtils';
import { HongkongDistrict } from '../addr';

interface Props {
  borderData: HongkongDistrict[];
  records: Record[];
  isViewMode: boolean;
  onChangeStatus?: (muniId: string, level: number) => void;
}

const MuniList = ({ borderData, records, isViewMode, onChangeStatus }: Props) => {
  return (
    <div className="municipalitiesList">
      <div>
        {borderData.map(muni => (
          <div key={muni.id} className="municipalityItem">
            <div
              className="municipalityName"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '60%',
              }}
            >
              <p>{muni.name}</p>
            </div>
            <RecordStatusDropdown
              value={getStatusLevelByMuniId(muni.id, records)}
              disabled={isViewMode || !isLogin()}
              onChange={(value: number) => {
                onChangeStatus?.(muni.id, Number(value));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(MuniList);
