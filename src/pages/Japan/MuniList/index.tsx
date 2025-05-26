import { memo, useState } from 'react';
import { chihous_data } from '../../../utils/map';
import { Municipality } from '../../../utils/addr';
import './index.css';

interface Props {
  muniBorderData: { municipalities: Municipality[]; prefecture: string }[];
}

const MuniList = ({ muniBorderData }: Props) => {
  const [expandedPrefectures, setExpandedPrefectures] = useState<string[]>([]);
  const togglePrefecture = (prefecture: string) => {
    setExpandedPrefectures(prev => (prev.includes(prefecture) ? prev.filter(p => p !== prefecture) : [...prev, prefecture]));
  };
  return (
    <div className="municipalitiesList">
      {chihous_data.map(chihou => {
        return (
          <div key={chihou.name}>
            <div className="municipalityItem" style={{ backgroundColor: chihou.color }}>
              {chihou.name}
            </div>
            <div>
              {muniBorderData.length > 0 &&
                chihou.pref.map(prefInChihou => {
                  const prefIndex = muniBorderData.findIndex(mp => {
                    return mp.prefecture === prefInChihou;
                  });
                  if (prefIndex !== -1) {
                    const prefMuniBorder = muniBorderData[prefIndex];
                    return (
                      <div key={prefMuniBorder.prefecture}>
                        <button
                          className={'prefDropdownButton ' + (expandedPrefectures.includes(prefMuniBorder.prefecture) ? 'prefDropdownButtonOpen' : '')}
                          onClick={() => togglePrefecture(prefMuniBorder.prefecture)}
                        >
                          <span>{prefMuniBorder.prefecture}</span>
                          <span className="prefDropdownButton-status">
                            <span>居住{0}</span>
                            <span>宿泊{0}</span>
                            <span>訪問{0}</span>
                            <span>接地{0}</span>
                            <span>通過{0}</span>
                            <span>未踏{0}</span>
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
                        {expandedPrefectures.includes(prefMuniBorder.prefecture) &&
                          prefMuniBorder.municipalities.map(muniBorder => (
                            <div key={muniBorder.id} className="municipalityItem">
                              <div className="municipalityName">{muniBorder.name}</div>
                              <div className="municipalityRegion">{(muniBorder.shinkoukyoku ?? '') + (muniBorder.gun_seireishi ?? '')}</div>
                              <div className="municipalityStatus">未踏破</div>
                            </div>
                          ))}
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
