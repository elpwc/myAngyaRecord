import { useIsMobile } from '../utils/hooks';
import { MapBackgroundTilesSwitcher } from './MapBackgroundTilesSwitcher';
import { isLogin } from '../utils/userUtils';
import { RecordGroupToolbar } from './RecordGroupToolbar';
import { RecordGroup } from '../utils/types';
import { MapsId } from '../utils/map';
import { LoginPanel } from './LoginPanel';
import { JSX } from 'react';

export interface LayerCheckboxInfo {
  name: string;
  title: string;
  checked: boolean;
}

const LayerCheckbox = ({ layer, onChange }: { layer: LayerCheckboxInfo; onChange: (name: string, checked: boolean) => void }) => {
  return (
    <label>
      <input
        type="checkbox"
        name={layer.name}
        checked={layer.checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, checked } = e.target;
          onChange(name, checked);
        }}
      />
      <span>{layer.title}</span>
    </label>
  );
};

export const AsideBar = ({
  currentRecordGroup,
  thisMapId,
  openMobileAsideMenu,
  currentTileMap,
  layers,
  list,
  onCurrentBackgroundTileMapChange,
  onLayerChange,
  onSelectRecordGroup,
}: {
  currentRecordGroup: RecordGroup | undefined;
  thisMapId: MapsId;
  openMobileAsideMenu: boolean;
  currentTileMap: string;
  layers: LayerCheckboxInfo[];
  list: JSX.Element;
  /** 当底图改变时 */
  onCurrentBackgroundTileMapChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 当图层改变时 */
  onLayerChange: (name: string, checked: boolean) => void;
  onSelectRecordGroup: (recordGroup: RecordGroup) => void;
}) => {
  const isMobile = useIsMobile();
  return (
    <aside
      style={{
        boxShadow: '0px 0px 10px 0px rgb(136, 136, 136)',
        zIndex: 3500,
        position: isMobile ? 'absolute' : 'unset',
        display: (isMobile && openMobileAsideMenu) || !isMobile ? 'unset' : 'none',
      }}
    >
      <div>
        <MapBackgroundTilesSwitcher currentTileMap={currentTileMap} onChange={onCurrentBackgroundTileMapChange} />
        <div className="map-tiles-checkbox-group">
          {layers.map(layer => {
            return <LayerCheckbox layer={layer} onChange={onLayerChange} />;
          })}
        </div>
      </div>
      {isLogin() ? <RecordGroupToolbar recordGroup={currentRecordGroup} thisMapId={thisMapId} onSelectRecordGroup={onSelectRecordGroup} /> : <LoginPanel />}

      {currentRecordGroup && list}
    </aside>
  );
};
