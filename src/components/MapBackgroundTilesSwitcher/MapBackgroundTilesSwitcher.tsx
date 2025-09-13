import { mapTiles } from '../../utils/map';
import defaultBg from './default.png';
import mapBg from './map.png';
import sateBg from './sate.png';
import './index.css';

export const MapBackgroundTilesSwitcher = ({ currentTileMap, onChange }: { currentTileMap: string; onChange: (id: string) => void }) => {
  const bgImages = [defaultBg, mapBg, sateBg];
  return (
    <div className="map-tiles-radio-group">
      {mapTiles.map((mapTile, index) => (
        <div
          className="map-tiles-radio"
          key={mapTile.id}
          onClick={() => {
            onChange(mapTile.id);
          }}
        >
          <img src={bgImages[index]} alt={mapTile.name} />
          <div className={'map-tiles-radio-text-container ' + (currentTileMap === mapTile.id ? 'selected' : '')}>
            <span>{mapTile.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
