import { ControlPosition } from 'leaflet';
import { useHint } from '../InfrastructureCompo/HintProvider';
import { POSITION_CLASSES } from '../../utils/types';
import './EditModeSwitchControl.css';
import { useAppContext } from '../../context';
import Avatar from '../InfrastructureCompo/Avatar';
import { LoginUserInfo } from '../../utils/userUtils';
import { Link } from 'react-router';
import appconfig from '../../appconfig';

interface Props {
  position: ControlPosition | undefined;
}

export const RecordGroupInfoControl = ({ position }: Props) => {
  const hint = useHint();
  const { currentRecordGroup, setCurrentRecordGroup } = useAppContext();
  const { loginUserInfo, setLoginUserInfo }: { loginUserInfo: LoginUserInfo; setLoginUserInfo: (v: LoginUserInfo) => void } = useAppContext();

  const compo = (
    <div style={{ marginLeft: '60px', marginTop: '10px', maxWidth: '90%', backgroundColor: 'white', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center', padding: '4px 10px' }}>
      <Link to={'/user/' + loginUserInfo.id} target="_blank" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Avatar avatarUrl={loginUserInfo.avatar} width={30} />
        <span>{loginUserInfo.name}</span>
      </Link>
      <div style={{ borderLeft: 'solid 1px gray', padding: '0 10px' }}>
        <span>{currentRecordGroup?.name}</span>
        <span style={{ color: 'gray', paddingLeft: '6px' }}>{currentRecordGroup?.desc}</span>
      </div>

      {/* ShareButton */}
      <button
        className="singleIcon-button"
        onClick={e => {
          navigator.clipboard
            .writeText(`${appconfig.siteBaseURL}/${currentRecordGroup.mapid}/${currentRecordGroup.id}`)
            .then(() => hint('bottom', 'この行脚記録のURLをｸﾘｯﾌﾟﾎﾞｰﾄにコピーしました！'))
            .catch(err => hint('bottom', 'この行脚記録のURLをｸﾘｯﾌﾟﾎﾞｰﾄにコピーできませんでした！', 'red', 2000));
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
        </svg>
      </button>
    </div>
  );

  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  return (
    <div className={positionClass}>
      <div className="leaflet-control">{compo}</div>
    </div>
  );
};
