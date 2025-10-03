import { memo, useState } from 'react';
import { chihous_data, getStatusLevelByMuniId } from '../../../utils/map';
import './index.css';
import { Record } from '../../../utils/types';
import { getPrefNameOfMuniById } from '../geojsonUtils';
import { Municipality } from '../addr';
import RecordStatusDropdown from '../../../components/AppCompo/RecordStatusDropdown';
import { getCurrentFillColorByLevel } from '../../../utils/serverUtils';
import { isLogin } from '../../../utils/userUtils';

interface Props {
  muniBorderData: { municipalities: Municipality[]; prefecture: string }[];
  records: Record[];
  showCheckbox?: boolean;
  isViewMode: boolean;
  onSelectedPrefChanged?: (pref: string[]) => void;
  onChangeStatus?: (muniId: string, level: number) => void;
}

const MuniList = ({ muniBorderData, records, showCheckbox, onSelectedPrefChanged, onChangeStatus, isViewMode }: Props) => {
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
            <div className="municipalityAreaItem flex" style={{ backgroundColor: chihou.color }}>
              {showCheckbox && (
                <input
                  type="checkbox"
                  id={chihou.name}
                  checked={selectedChihous.includes(chihou.name)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.stopPropagation();
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
                      plan: prefData.filter(muni => {
                        return muni.level === 6;
                      }).length,
                      notReach: 0,
                    };
                    angyaStatus.notReach = prefMuniBorder.municipalities.length - (angyaStatus.live + angyaStatus.stay + angyaStatus.visit + angyaStatus.ground + angyaStatus.pass);
                    return (
                      <div key={prefMuniBorder.prefecture}>
                        <div className="prefInfoContainer">
                          <div className={'prefInfoContainerTitle ' + (expandedPrefectures.includes(prefMuniBorder.prefecture) ? 'prefInfoContainerTitleOpen' : '')}>
                            <div className="flex" style={{ padding: '0 4px', justifyContent: 'space-between' }}>
                              <span>
                                {showCheckbox && (
                                  <input
                                    type="checkbox"
                                    id={prefMuniBorder.prefecture}
                                    checked={selectedPrefectures.includes(prefMuniBorder.prefecture)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      e.stopPropagation();
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
                                <label htmlFor={prefMuniBorder.prefecture} style={{ padding: '0 4px' }}>
                                  {prefMuniBorder.prefecture}
                                </label>
                              </span>
                              <span style={{ color: '#7f8ebb', paddingRight: '10px', fontSize: '12px' }}>
                                {`踏${Math.round(
                                  ((angyaStatus.live + angyaStatus.stay + angyaStatus.visit + angyaStatus.ground + angyaStatus.pass) / prefMuniBorder.municipalities.length) * 100
                                )}% 全${Math.round(
                                  ((angyaStatus.live * 6 + angyaStatus.stay * 5 + angyaStatus.visit * 4 + angyaStatus.ground * 3 + angyaStatus.pass * 2) / (prefMuniBorder.municipalities.length * 5)) *
                                    100
                                )}%`}
                              </span>
                            </div>
                            <button className={'prefDropdownButton'} onClick={() => togglePrefecture(prefMuniBorder.prefecture)}>
                              <span className="prefDropdownButton-status">
                                <span>居住{angyaStatus.live}</span>
                                <span>宿泊{angyaStatus.stay}</span>
                                <span>訪問{angyaStatus.visit}</span>
                                <span>接地{angyaStatus.ground}</span>
                                <span>通過{angyaStatus.pass}</span>
                                <span>未踏{angyaStatus.notReach}</span>
                                <span>計画{angyaStatus.plan}</span>
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
                          </div>

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
                              let total = prefMuniBorder.municipalities.length;
                              let value: number = Object.values(angyaStatus)[5 - level];
                              if (isLogin()) {
                                total = prefMuniBorder.municipalities.length;
                                value = Object.values(angyaStatus)[5 - level];
                              } else {
                                // 未登录时显示颜色预览
                                total = 100;
                                value = Math.random() * 15;
                              }
                              const widthPercent = total > 0 ? (value / total) * 100 : 0;
                              return (
                                <div
                                  key={level}
                                  style={{
                                    width: `${widthPercent}%`,
                                    height: '100%',
                                    background: getCurrentFillColorByLevel(level),
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
                                <RecordStatusDropdown
                                  value={getStatusLevelByMuniId(muniBorder.id, records)}
                                  disabled={isViewMode || !isLogin()}
                                  onChange={(value: number) => {
                                    onChangeStatus?.(muniBorder.id, Number(value));
                                  }}
                                />
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
