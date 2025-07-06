import { mapTiles } from '../utils/map';

export const MapBackgroundTilesSwitcher = ({ currentTileMap, onChange }: { currentTileMap: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <div className="map-tiles-radio-group">
      {mapTiles.map(mapTile => (
        <label key={mapTile.id}>
          <input type="radio" value={mapTile.id} checked={currentTileMap === mapTile.id} onChange={onChange} />
          <span>{mapTile.name}</span>
        </label>
      ))}
    </div>
  );
};
