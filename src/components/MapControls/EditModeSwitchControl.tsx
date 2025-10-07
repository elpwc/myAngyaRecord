import { ControlPosition } from 'leaflet';
import { useHint } from '../InfrastructureCompo/HintProvider';
import { POSITION_CLASSES } from '../../utils/types';
import { getMapStyleBgColor, getMapStyleColor } from '../../utils/mapStyles';
import { recordStatus } from '../../utils/map';
import './EditModeSwitchControl.css';
import { useAppContext } from '../../context';
import { isLogin } from '../../utils/userUtils';

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
        <button
          className={`editModeSwitchControl-toggle ${isContinuousEditOn ? 'on' : ''}`}
          onClick={() => {
            if (isLogin()) {
              setIsContinuousEditOn(!isContinuousEditOn);
            } else {
              hint('top', 'まずログインしてから記録してくださいね', 'red', 2000);
            }
          }}
        >
          <span className="label">連続塗り</span>
          <span className="status">{isContinuousEditOn ? 'ON' : 'OFF'}</span>
        </button>

        <div className={`editModeSwitchControl-dropDown ${isContinuousEditOn ? 'open' : ''}`}>
          {recordStatus.map(recordStatusItem => (
            <button
              key={recordStatusItem.value}
              className={'editModeSwitchControl-option ' + (currentContinuousEditValue === recordStatusItem.value ? 'editModeSwitchControl-option-selected' : '')}
              style={{
                backgroundColor: getMapStyleBgColor(currentMapStyle, recordStatusItem.value),
                color: getMapStyleColor(currentMapStyle, recordStatusItem.value),
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
