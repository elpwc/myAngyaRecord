import { ControlPosition } from 'leaflet';
import { useHint } from '../InfrastructureCompo/HintProvider';
import { POSITION_CLASSES } from '../../utils/types';
import { mapStyles } from '../../utils/mapStyles';
import { recordStatus } from '../../utils/map';
import './EditModeSwitchControl.css';
import { useAppContext } from '../../context';

interface Props {
  position: ControlPosition | undefined;
}

export const EditModeSwitchControl = ({ position }: Props) => {
  const hint = useHint();
  const { currentMapStyle } = useAppContext();
  const { isContinuousEditOn, setIsContinuousEditOn } = useAppContext();
  const { currentContinuousEditValue, setCurrentContinuousEditValue } = useAppContext();

  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  return (
    <div className={positionClass}>
      <div className="leaflet-control editModeSwitchControl">
        <button className={`editModeSwitchControl-toggle ${isContinuousEditOn ? 'on' : ''}`} onClick={() => setIsContinuousEditOn(!isContinuousEditOn)}>
          <span className="label">連続塗り</span>
          <span className="status">{isContinuousEditOn ? 'ON' : 'OFF'}</span>
        </button>

        <div className={`editModeSwitchControl-dropDown ${isContinuousEditOn ? 'open' : ''}`}>
          {recordStatus.map(recordStatusItem => (
            <button
              key={recordStatusItem.value}
              className={'editModeSwitchControl-option ' + (currentContinuousEditValue === recordStatusItem.value ? 'editModeSwitchControl-option-selected' : '')}
              style={{
                backgroundColor: mapStyles[currentMapStyle].bgcolor[recordStatusItem.value],
                color: mapStyles[currentMapStyle].color[recordStatusItem.value],
              }}
              onClick={() => setCurrentContinuousEditValue(recordStatusItem.value)}
            >
              {recordStatusItem.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
