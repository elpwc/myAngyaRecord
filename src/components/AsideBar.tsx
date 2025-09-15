import { useIsMobile } from '../utils/hooks';
import { MapBackgroundTilesSwitcher } from './MapBackgroundTilesSwitcher/MapBackgroundTilesSwitcher';
import { isLogin } from '../utils/userUtils';
import { RecordGroupToolbar } from './RecordGroupToolbar';
import { RecordGroup } from '../utils/types';
import { MapsId } from '../utils/map';
import { LoginPanel } from './LoginPanel';
import { JSX } from 'react';
import { motion } from 'framer-motion';

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
  onCurrentBackgroundTileMapChange: (id: string) => void;
  /** 当图层改变时 */
  onLayerChange: (name: string, checked: boolean) => void;
  onSelectRecordGroup: (recordGroup: RecordGroup) => void;
}) => {
  const isMobile = useIsMobile();
  return (
    <motion.aside
      style={{
        borderRight: '1px solid #ccc',
        zIndex: 3500,
        position: isMobile ? 'absolute' : 'unset',
        height: '100%',
      }}
      initial="closed"
      animate={(isMobile && openMobileAsideMenu) || !isMobile ? 'open' : 'closed'}
      variants={{
        open: { x: 0, opacity: 1, display: 'unset', transition: { duration: 0.15 } },
        closed: { x: '-100%', opacity: 0, transition: { duration: 0.15 }, transitionEnd: { display: 'none' } },
      }}
    >
      <div>
        <MapBackgroundTilesSwitcher currentTileMap={currentTileMap} onChange={onCurrentBackgroundTileMapChange} />
        <div className="map-tiles-checkbox-group">
          {layers.map(layer => {
            return <LayerCheckbox key={layer.name} layer={layer} onChange={onLayerChange} />;
          })}
        </div>
      </div>
      {isLogin() ? (
        <RecordGroupToolbar recordGroup={currentRecordGroup} thisMapId={thisMapId} onSelectRecordGroup={onSelectRecordGroup} />
      ) : (
        <div style={{ height: '100%', backgroundColor: '#ffffffa1' }}>
          <div style={{ padding: '10px', borderRadius: '5px', backgroundColor: 'white', margin: '20px', border: 'solid 1px #c1c1c1', paddingBottom: '30px' }}>
            <LoginPanel direction="column" />
          </div>
        </div>
      )}

      {currentRecordGroup && list}
    </motion.aside>
  );
};
