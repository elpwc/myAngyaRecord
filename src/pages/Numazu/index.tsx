import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { AttributionControl, MapContainer, Marker, Polygon, Polyline, Popup, ScaleControl, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import { chihous_data, getBounds, mapTiles } from '../../utils/map';
import { getNumazuOoazaData } from './geojsonUtils';
import { Municipality, Prefecture, Railway } from '../../utils/addr';
import MapPopup from '../../components/MapPopup';
import { divIcon, LatLngTuple } from 'leaflet';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;
  const [currentTileMap, setCurrentTileMap] = useState('blank');
  const [layers, setLayers] = useState({
    pref: true,
    placename: true,
  });
  const [prefBorderData, setprefBorderData]: [Prefecture[], any] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(5);

  useEffect(() => {
    (async () => {
      setprefBorderData(await getNumazuOoazaData());
    })();
  }, []);

  const handleMapStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTileMap(e.target.value);
  };

  const handleLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setLayers(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const ZoomListener = () => {
    const map = useMapEvents({
      zoomend: () => {
        setCurrentZoom(map.getZoom());
        console.log(map.getZoom());
      },
    });
    return null;
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex' }}>
      <div>
        <div>
          <div className="map-tiles-radio-group">
            {mapTiles.map(mapTile => (
              <label key={mapTile.id}>
                <input type="radio" value={mapTile.id} checked={currentTileMap === mapTile.id} onChange={handleMapStyleChange} />
                <span>{mapTile.name}</span>
              </label>
            ))}
          </div>
          <div className="map-tiles-checkbox-group">
            <label>
              <input type="checkbox" name="placename" checked={layers.placename} onChange={handleLayerChange} />
              <span>地名表示</span>
            </label>
          </div>
        </div>
        <div className="municipalitiesList">
          {prefBorderData.map(ooaza => {
            return (
              <div key={ooaza.id} className="municipalityItem">
                <div className="municipalityName">{ooaza.name}</div>
                <div className="municipalityStatus">未踏破</div>
              </div>
            );
          })}
        </div>
      </div>
      <MapContainer center={[36.016142, 137.990904]} zoom={5} scrollWheelZoom={true} attributionControl={false} className="mapContainer">
        <ZoomListener />
        <ScaleControl position="bottomleft" />
        <AttributionControl position="bottomright" prefix={'Dev by <a href="https://github.com/elpwc" target="_blank">@elpwc</a>'} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapTiles.find(tile => tile.id === currentTileMap)?.url || mapTiles[0].url}
        />
        {
          /* 都道府县 */
          layers.pref &&
            prefBorderData.map(prefBorder => {
              // 计算中心点
              const center = getBounds(prefBorder.coordinates);
              return (
                <Polygon className="muniBorder" pathOptions={{ fillColor: '#ffffff33', opacity: 1, fillOpacity: 1.5, weight: 0.7, color: 'black' }} positions={prefBorder.coordinates}>
                  <Popup>
                    <MapPopup addr={'沼津市'} name={prefBorder.name} onClick={value => {}} />
                  </Popup>
                  {currentZoom >= 8 && layers.placename && (
                    <Marker
                      position={center as LatLngTuple}
                      icon={divIcon({
                        className: 'munilabels',
                        html: `<span class="">${prefBorder.name}</span>`,
                        iconSize: [60, 20],
                        iconAnchor: [30, 10],
                      })}
                    />
                  )}
                </Polygon>
              );
            })
        }
      </MapContainer>
    </div>
  );
};
