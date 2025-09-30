import { ControlPosition } from 'leaflet';
import { useGlobalStore } from '../utils/globalStore';
import { recordStatus } from '../utils/map';
import { mapStyles } from '../utils/mapStyles';
import { POSITION_CLASSES } from '../utils/types';
import { useHint } from './HintProvider';
import Dropdown from './Dropdown';
import PrettyDropdown from './PrettyDropdown';
import { c_mapStyle } from '../utils/cookies';

interface Props {
  position: ControlPosition | undefined;
}

export const MapStyleControl = ({ position }: Props) => {
  const hint = useHint();
  const [currentMapStyle, setCurrentMapStyle] = useGlobalStore(s => s.mapStyle);

  const compo = (
    <div style={{ paddingBottom: '10px' }}>
      <PrettyDropdown
        bordered={false}
        showArrow={false}
        optionStyle={{ backgroundColor: 'transparent' }}
        options={mapStyles.map((mapStyle, index) => {
          return {
            value: index,
            getCaption: (isShownOnTop?: boolean, isSelected?: boolean) => {
              return (
                <div>
                  {/*!isShownOnTop && <label>{mapStyle.title}</label>*/}
                  <div style={{ display: 'flex', borderRadius: '8px', border: 'none', width: 'fit-content' }}>
                    {recordStatus.map((recordStatusItem, index) => {
                      return (
                        <div
                          key={recordStatusItem.value}
                          style={{
                            backgroundColor: mapStyle.bgcolor[recordStatusItem.value],
                            color: mapStyle.color[recordStatusItem.value],
                            padding: '6px',
                            borderRadius: index === 0 ? '8px 0 0 8px' : index === recordStatus.length - 1 ? '0 8px 8px 0' : '0px',
                          }}
                        >
                          {recordStatusItem.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            },
          };
        })}
        value={currentMapStyle}
        onChange={value => {
          setCurrentMapStyle((s: any) => ({ ...s, mapStyle: value }));
          c_mapStyle(value.toString());
          hint('bottom', '地図テーマを変更しました');
        }}
      />
    </div>
  );

  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  return (
    <div className={positionClass}>
      <div className="leaflet-control">{compo}</div>
    </div>
  );
};
