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
  isViewMode,
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
  isViewMode: boolean;
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
        position: isMobile ? 'absolute' : 'initial',
        height: 'calc(100vh - 46.18px)',
        maxWidth: isMobile ? '100%' : '45%',
      }}
      initial="closed"
      animate={(isMobile && openMobileAsideMenu) || !isMobile ? 'open' : 'closed'}
      variants={{
        open: { x: 0, opacity: 1, display: 'unset', transition: { duration: 0.15 } },
        closed: { x: '-100%', opacity: 0, transition: { duration: 0.15 }, transitionEnd: { display: 'none' } },
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <MapBackgroundTilesSwitcher currentTileMap={currentTileMap} onChange={onCurrentBackgroundTileMapChange} />
          <div className="map-tiles-checkbox-group">
            {layers.map(layer => {
              return <LayerCheckbox key={layer.name} layer={layer} onChange={onLayerChange} />;
            })}
          </div>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <RecordGroupToolbar recordGroup={currentRecordGroup} thisMapId={thisMapId} isViewMode={isViewMode} onSelectRecordGroup={onSelectRecordGroup} />
          {list}
          {!isLogin() && !isViewMode && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backdropFilter: 'blur(2px)',
                background: 'rgba(255,255,255,0.5)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  height: 'fit-content',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  margin: '20px',
                  border: 'solid 1px #c1c1c1',
                  paddingBottom: '30px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                <LoginPanel direction="column" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
