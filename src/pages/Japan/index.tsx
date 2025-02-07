import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { AttributionControl, MapContainer, Marker, Polygon, Polyline, Popup, ScaleControl, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import { chihous_data, getBounds, mapTiles } from '../../utils/map';
import { getMunicipalitiesData, getPrefecture_ShinkoukyokuData, getRailwaysData } from './geojsonUtils';
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
    muni: true,
    sinkoukyoku: true,
    placename: true,
    railways: false,
  });
  const [prefBorderData, setprefBorderData]: [Prefecture[], any] = useState([]);
  const [shinkouBorderData, setshinkouBorderData]: [Prefecture[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [Railway[], any] = useState([]);
  const [muniBorderData, setmuniBorderData]: [{ municipalities: Municipality[]; prefecture: string }[], any] = useState([]);
  const [expandedPrefectures, setExpandedPrefectures] = useState<string[]>([]);
  const [currentZoom, setCurrentZoom] = useState(5);

  useEffect(() => {
    (async () => {
      setprefBorderData(await getPrefecture_ShinkoukyokuData());
      setshinkouBorderData(await getPrefecture_ShinkoukyokuData(true));
      setmuniBorderData(await getMunicipalitiesData());
      setrailwaysData(await getRailwaysData());
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

  const togglePrefecture = (prefecture: string) => {
    setExpandedPrefectures(prev => (prev.includes(prefecture) ? prev.filter(p => p !== prefecture) : [...prev, prefecture]));
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
              <input type="checkbox" name="pref" checked={layers.pref} onChange={handleLayerChange} />
              <span>都道府県表示</span>
            </label>

            <label>
              <input type="checkbox" name="muni" checked={layers.muni} onChange={handleLayerChange} />
              <span>市区町村表示</span>
            </label>

            <label>
              <input type="checkbox" name="sinkoukyoku" checked={layers.sinkoukyoku} onChange={handleLayerChange} />
              <span>北海道支庁表示</span>
            </label>

            <label>
              <input type="checkbox" name="placename" checked={layers.placename} onChange={handleLayerChange} />
              <span>地名表示</span>
            </label>

            <label>
              <input type="checkbox" name="railways" checked={layers.railways} onChange={handleLayerChange} />
              <span>全国鉄道路線</span>
            </label>
          </div>
        </div>
        <div className="municipalitiesList">
          {chihous_data.map(chihou => {
            return (
              <div key={chihou.name}>
                <div className="municipalityItem" style={{ backgroundColor: chihou.color }}>
                  {chihou.name}
                </div>
                <div>
                  {muniBorderData.length > 0 &&
                    chihou.pref.map(prefInChihou => {
                      const prefIndex = muniBorderData.findIndex(mp => {
                        return mp.prefecture === prefInChihou;
                      });
                      if (prefIndex !== -1) {
                        const prefMuniBorder = muniBorderData[prefIndex];
                        return (
                          <div key={prefMuniBorder.prefecture}>
                            <button
                              className={'prefDropdownButton ' + (expandedPrefectures.includes(prefMuniBorder.prefecture) ? 'prefDropdownButtonOpen' : '')}
                              onClick={() => togglePrefecture(prefMuniBorder.prefecture)}
                            >
                              <span>{prefMuniBorder.prefecture}</span>
                              <span className="prefDropdownButton-status">
                                <span>居住{0}</span>
                                <span>宿泊{0}</span>
                                <span>訪問{0}</span>
                                <span>接地{0}</span>
                                <span>通過{0}</span>
                                <span>未踏{0}</span>
                              </span>
                              <span>{expandedPrefectures.includes(prefMuniBorder.prefecture) ? '▼' : '▶'}</span>
                            </button>
                            {expandedPrefectures.includes(prefMuniBorder.prefecture) &&
                              prefMuniBorder.municipalities.map(muniBorder => (
                                <div key={muniBorder.id} className="municipalityItem">
                                  <div className="municipalityName">{muniBorder.name}</div>
                                  <div className="municipalityRegion">{(muniBorder.shinkoukyoku ?? '') + (muniBorder.gun_seireishi ?? '')}</div>
                                  <div className="municipalityStatus">未踏破</div>
                                </div>
                              ))}
                          </div>
                        );
                      }
                      return <></>;
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <MapContainer center={[36.016142, 137.990904]} zoom={5} scrollWheelZoom={true} attributionControl={false} style={{ height: '100%', width: '100%' }}>
        <ZoomListener />
        <ScaleControl position="bottomleft" />
        <AttributionControl position="bottomright" prefix={'Dev by <a href="https://github.com/elpwc" target="_blank">@elpwc</a>'} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapTiles.find(tile => tile.id === currentTileMap)?.url || mapTiles[0].url}
        />
        {
          /* 市区町村 */
          layers.muni &&
            muniBorderData.map(prefMuniBorder => {
              return prefMuniBorder.municipalities.map(muniBorder => {
                // 计算中心点
                const center = getBounds(muniBorder.coordinates);

                return (
                  <Polygon className="muniBorder" pathOptions={{ fillColor: '#ffffff33', color: 'black', opacity: 1, fillOpacity: 1, weight: 0.4 }} positions={muniBorder.coordinates}>
                    <Popup>
                      <MapPopup addr={(muniBorder.pref ?? '') + (muniBorder.shinkoukyoku ?? '') + (muniBorder.gun_seireishi ?? '')} name={muniBorder.name} onClick={value => {}} />
                    </Popup>
                    {currentZoom >= 8 && layers.placename && (
                      <Marker
                        position={center as LatLngTuple}
                        icon={divIcon({
                          className: 'munilabels',
                          html: `<span class="munilabels-specialCityName">${muniBorder.is_special_city_ward ? muniBorder.gun_seireishi : ''}</span><br /><span>${muniBorder.name}</span>`,
                          iconSize: [60, 20],
                          iconAnchor: [30, 10],
                        })}
                      />
                    )}
                  </Polygon>
                );
              });
            })
        }
        {
          /* 铁道 */
          layers.railways &&
            railwaysData.map(railwayLines => {
              return (
                <Polyline
                  pathOptions={railwayLines.isJR ? { weight: 1.5, color: 'darkred', opacity: 1, fillOpacity: 1 } : { weight: 1, color: 'blue', opacity: 1, fillOpacity: 1 }}
                  positions={railwayLines.coordinates}
                  interactive={false}
                />
              );
            })
        }
        {
          /* 都道府县 */
          layers.pref &&
            prefBorderData.map(prefBorder => {
              // 计算中心点
              const center = getBounds(prefBorder.coordinates);
              return (
                <Polygon pathOptions={{ fillColor: '#ffffff33', opacity: 1, fillOpacity: 1.5, weight: 0.7, color: 'black' }} positions={prefBorder.coordinates} interactive={false}>
                  {currentZoom < 8 && layers.placename && (
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
        {
          /* 振兴局 */
          layers.sinkoukyoku &&
            shinkouBorderData.map(shinkouBorder => {
              // 计算中心点
              const center = getBounds(shinkouBorder.coordinates);
              return (
                <Polygon pathOptions={{ fillColor: '#ffffff33', opacity: 1, fillOpacity: 1.5, weight: 0.7, color: 'black' }} positions={shinkouBorder.coordinates} interactive={false}>
                  {currentZoom < 8 && layers.placename && (
                    <Marker
                      position={center as LatLngTuple}
                      icon={divIcon({
                        className: 'munilabels',
                        html: `<span class="">${shinkouBorder.name}</span>`,
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
