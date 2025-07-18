import { memo, useState } from 'react';
import { chihous_data } from '../../../utils/map';
import './index.css';
import { Record } from '../../../utils/types';
import { getFillcolor, getForecolor } from '../../../utils/serverUtils';
import { mapStyles } from '../../../utils/mapStyles';
import { getPrefNameOfMuniById } from '../geojsonUtils';
import { Municipality } from '../addr';

interface Props {
  muniBorderData: { municipalities: Municipality[]; prefecture: string }[];
  records: Record[];
  currentMapStyle?: number;
  showCheckbox?: boolean;
  onSelectedPrefChanged?: (pref: string[]) => void;
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

const MuniList = ({ muniBorderData, records, currentMapStyle = 0, showCheckbox, onSelectedPrefChanged }: Props) => {
  const [expandedPrefectures, setExpandedPrefectures] = useState<string[]>([]);
  const [selectedChihous, setSelectedChihous] = useState<string[]>([]);
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const togglePrefecture = (prefecture: string) => {
    setExpandedPrefectures(prev => (prev.includes(prefecture) ? prev.filter(p => p !== prefecture) : [...prev, prefecture]));
  };
  return (
    <div className="municipalitiesList">
      {chihous_data.map(chihou => {
        return (
          <div key={chihou.name}>
            <div className="municipalityItem flex" style={{ backgroundColor: chihou.color }}>
              {showCheckbox && (
                <input
                  type="checkbox"
                  id={chihou.name}
                  checked={selectedChihous.includes(chihou.name)}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                    if (e.currentTarget.checked) {
                      setSelectedChihous(prev => [...prev, chihou.name]);
                      chihou.pref.forEach(pref => {
                        if (!selectedPrefectures.includes(pref)) {
                          setSelectedPrefectures(prev => [...prev, pref]);
                        }
                      });
                      if (onSelectedPrefChanged) {
                        onSelectedPrefChanged([...selectedPrefectures, ...chihou.pref]);
                      }
                    } else {
                      setSelectedChihous(prev => prev.filter(c => c !== chihou.name));
                      setSelectedPrefectures((prev: string[]) => prev.filter(pref => !chihou.pref.includes(pref)));
                      if (onSelectedPrefChanged) {
                        onSelectedPrefChanged(selectedPrefectures.filter(c => !chihou.pref.includes(c)));
                      }
                    }
                  }}
                />
              )}

              <span>
                <label htmlFor={chihou.name}>{chihou.name}</label>
              </span>
            </div>
            <div>
              {muniBorderData.length > 0 &&
                chihou.pref.map(prefInChihou => {
                  const prefIndex = muniBorderData.findIndex(mp => {
                    return mp.prefecture === prefInChihou;
                  });
                  if (prefIndex !== -1) {
                    const prefData = records.filter(record => getPrefNameOfMuniById(record.admin_id) === prefInChihou);
                    const prefMuniBorder = muniBorderData[prefIndex];
                    const angyaStatus = {
                      live: prefData.filter(muni => {
                        return muni.level === 5;
                      }).length,
                      stay: prefData.filter(muni => {
                        return muni.level === 4;
                      }).length,
                      visit: prefData.filter(muni => {
                        return muni.level === 3;
                      }).length,
                      ground: prefData.filter(muni => {
                        return muni.level === 2;
                      }).length,
                      pass: prefData.filter(muni => {
                        return muni.level === 1;
                      }).length,
                      notReach: 0,
                    };
                    angyaStatus.notReach = prefMuniBorder.municipalities.length - (angyaStatus.live + angyaStatus.stay + angyaStatus.visit + angyaStatus.ground + angyaStatus.pass);
                    return (
                      <div key={prefMuniBorder.prefecture}>
                        <div className="prefInfoContainer">
                          <button
                            className={'prefDropdownButton ' + (expandedPrefectures.includes(prefMuniBorder.prefecture) ? 'prefDropdownButtonOpen' : '')}
                            onClick={() => togglePrefecture(prefMuniBorder.prefecture)}
                          >
                            <div className="flex">
                              {showCheckbox && (
                                <input
                                  type="checkbox"
                                  id={prefMuniBorder.prefecture}
                                  checked={selectedPrefectures.includes(prefMuniBorder.prefecture)}
                                  onClick={e => {
                                    if (e.currentTarget.checked) {
                                      if (!selectedPrefectures.includes(prefMuniBorder.prefecture)) {
                                        setSelectedPrefectures(prev => [...prev, prefMuniBorder.prefecture]);
                                      }
                                      if (onSelectedPrefChanged) {
                                        onSelectedPrefChanged([...selectedPrefectures, prefMuniBorder.prefecture]);
                                      }
                                    } else {
                                      setSelectedPrefectures((prev: string[]) => prev.filter(pref => pref !== prefMuniBorder.prefecture));
                                      if (onSelectedPrefChanged) {
                                        onSelectedPrefChanged(selectedPrefectures.filter(c => c !== prefMuniBorder.prefecture));
                                      }
                                    }
                                  }}
                                />
                              )}
                              <span>
                                <label htmlFor={prefMuniBorder.prefecture}>{prefMuniBorder.prefecture}</label>
                              </span>
                            </div>
                            <span className="prefDropdownButton-status">
                              <span>居住{angyaStatus.live}</span>
                              <span>宿泊{angyaStatus.stay}</span>
                              <span>訪問{angyaStatus.visit}</span>
                              <span>接地{angyaStatus.ground}</span>
                              <span>通過{angyaStatus.pass}</span>
                              <span>未踏{angyaStatus.notReach}</span>
                            </span>
                            <span className="prefDropDownButtonIcon">
                              {expandedPrefectures.includes(prefMuniBorder.prefecture) ? (
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
                              const total = prefMuniBorder.municipalities.length;
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
                          {expandedPrefectures.includes(prefMuniBorder.prefecture) &&
                            prefMuniBorder.municipalities.map(muniBorder => (
                              <div key={muniBorder.id} className="municipalityItem">
                                <div className="municipalityName">{muniBorder.name}</div>
                                <div className="municipalityRegion">{(muniBorder.shinkoukyoku ?? '') + (muniBorder.gun_seireishi ?? '')}</div>
                                <div
                                  className="municipalityStatus"
                                  style={{ backgroundColor: getFillcolor(currentMapStyle, records, muniBorder.id), color: getForecolor(currentMapStyle, records, muniBorder.id) }}
                                >
                                  {getStatusByMuniId(muniBorder.id, records)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  }
                  return <></>;
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(MuniList);
