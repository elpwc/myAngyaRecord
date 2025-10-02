import { ControlPosition } from 'leaflet';
import { recordStatus } from '../../utils/map';
import { mapStyles } from '../../utils/mapStyles';
import { POSITION_CLASSES } from '../../utils/types';
import { useHint } from '../InfrastructureCompo/HintProvider';
import PrettyDropdown from '../InfrastructureCompo/PrettyDropdown';
import { c_mapStyle } from '../../utils/cookies';
import './MapStyleControl.css';
import { useAppContext } from '../../context';

interface Props {
  position: ControlPosition | undefined;
}

export const MapStyleControl = ({ position }: Props) => {
  const hint = useHint();
  const { currentMapStyle, setCurrentMapStyle } = useAppContext();

  const compo = (
    <div style={{ paddingBottom: '16px', paddingRight: '36px' }}>
      <PrettyDropdown
        mainClassname="mapStyleControl-main-container"
        bordered={false}
        showArrow={false}
        dropdownClassname="mapStyleControl-dropdownlist"
        dropdownStyle={{ backgroundColor: '#ffffff98', backdropFilter: 'blur(2px)' }}
        optionStyle={{ backgroundColor: 'transparent' }}
        options={mapStyles.map((mapStyle, index) => {
          return {
            value: index,
            getCaption: (isShownOnTop?: boolean, isSelected?: boolean) => {
              return (
                <div className={'mapStyleControl-option-container ' + (isShownOnTop ? '' : 'mapStyleControl-option-item-container ') + (isSelected ? 'mapStyleControl-option-selected-container' : '')}>
                  {!isShownOnTop && <label>{mapStyle.title + (isSelected ? '(使用中)' : '')}</label>}
                  <div
                    className={'mapStyleControl-option ' + (isShownOnTop ? 'mapStyleControl-option-main ' : 'mapStyleControl-option-item ') + (isSelected ? 'mapStyleControl-option-selected' : '')}
                    style={{}}
                  >
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
          setCurrentMapStyle(Number(value));
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
