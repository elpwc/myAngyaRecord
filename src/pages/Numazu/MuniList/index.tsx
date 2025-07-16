import { memo, useState } from 'react';
import { chihous_data } from '../../../utils/map';
import './index.css';
import { Record } from '../../../utils/types';
import { getFillcolor, getForecolor } from '../../../utils/serverUtils';
import { mapStyles } from '../../../utils/mapStyles';
import { Ooaza, OoazaArea } from '../addr';
import { getOoazaInstanceById } from '../geojsonUtils';

interface Props {
  areaData: OoazaArea[];
  borderData: Ooaza[];
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

const MuniList = ({ areaData, borderData, records, currentMapStyle = 0 }: Props) => {
  const [expandedPrefectures, setExpandedPrefectures] = useState<string[]>([]);
  const togglePrefecture = (prefecture: string) => {
    setExpandedPrefectures(prev => (prev.includes(prefecture) ? prev.filter(p => p !== prefecture) : [...prev, prefecture]));
  };
  return (
    <div className="municipalitiesList">
      <div>
        {areaData.length > 0 &&
          areaData
            .sort((a, b) => {
              return Number(a.id) - Number(b.id);
            })
            .map(area => {
              const areaAllOoazaData = borderData.filter(ooaza => ooaza.area === area.name);
              const areaRecordData = records.filter(record => getOoazaInstanceById(borderData, record.admin_id)?.area === area.name);
              const angyaStatus = {
                live: areaRecordData.filter(muni => {
                  return muni.level === 5;
                }).length,
                stay: areaRecordData.filter(muni => {
                  return muni.level === 4;
                }).length,
                visit: areaRecordData.filter(muni => {
                  return muni.level === 3;
                }).length,
                ground: areaRecordData.filter(muni => {
                  return muni.level === 2;
                }).length,
                pass: areaRecordData.filter(muni => {
                  return muni.level === 1;
                }).length,
                notReach: 0,
              };
              angyaStatus.notReach = areaAllOoazaData.length - (angyaStatus.live + angyaStatus.stay + angyaStatus.visit + angyaStatus.ground + angyaStatus.pass);
              return (
                <div key={area.id}>
                  <div className="prefInfoContainer">
                    <button className={'prefDropdownButton ' + (expandedPrefectures.includes(area.name) ? 'prefDropdownButtonOpen' : '')} onClick={() => togglePrefecture(area.name)}>
                      <span>{area.name + '地区'}</span>
                      <span className="prefDropdownButton-status">
                        <span>居住{angyaStatus.live}</span>
                        <span>宿泊{angyaStatus.stay}</span>
                        <span>訪問{angyaStatus.visit}</span>
                        <span>接地{angyaStatus.ground}</span>
                        <span>通過{angyaStatus.pass}</span>
                        <span>未踏{angyaStatus.notReach}</span>
                      </span>
                      <span className="prefDropDownButtonIcon">
                        {expandedPrefectures.includes(area.name) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                          </svg>
                        )}
                      </span>
                    </button>
                    <div
                      className="progress"
                      style={{
                        position: 'relative',
                        marginBottom: 1,
                        width: '100%',
                        height: 4,
                        display: 'flex',
                        zIndex: 1,
                        pointerEvents: 'none',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      {[5, 4, 3, 2, 1, 0].map(level => {
                        const total = areaAllOoazaData.length;
                        const value: number = Object.values(angyaStatus)[5 - level];
                        const widthPercent = total > 0 ? (value / total) * 100 : 0;
                        return (
                          <div
                            key={level}
                            style={{
                              width: `${widthPercent}%`,
                              height: '100%',
                              background: mapStyles[currentMapStyle].bgcolor[level],
                              transition: 'width 0.3s',
                            }}
                          />
                        );
                      })}
                    </div>
                    {expandedPrefectures.includes(area.name) &&
                      areaAllOoazaData.map(ooaza => (
                        <div key={ooaza.id} className="municipalityItem">
                          <div className="municipalityName">{ooaza.name}</div>
                          <div className="municipalityStatus" style={{ backgroundColor: getFillcolor(currentMapStyle, records, ooaza.id), color: getForecolor(currentMapStyle, records, ooaza.id) }}>
                            {getStatusByMuniId(ooaza.id, records)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default memo(MuniList);
