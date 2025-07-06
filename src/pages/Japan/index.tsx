import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { AttributionControl, MapContainer, Marker, Polygon, Polyline, Popup, ScaleControl, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { chihous_data, getBounds, getLabelPosition, MapsId, mapTiles } from '../../utils/map';
import { getMunicipalitiesData, getPrefecture_ShinkoukyokuData, getRailwaysData } from './geojsonUtils';
import { InstitutionTypeCd, Municipality, Prefecture, Railway, RailwayClassCd } from '../../utils/addr';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import {
  getFillcolor,
  getForecolor,
  getRecordGroups,
  getRecords,
  getShinkoukyokuFillColor,
  getShinkoukyokuForeColor,
  getTodofukenFillColor,
  getTodofukenForeColor,
  postRecord,
  postRecordGroup,
} from '../../utils/serverUtils';
import MuniList from './MuniList';
import { NewGroupModal } from '../../components/modals/NewGroupModal';
import { GroupListModal } from '../../components/modals/GroupListModal';
import { Record, RecordGroup } from '../../utils/types';
import moment from 'moment';
import { isLogin } from '../../utils/userUtils';
import { c_lat, c_lng, c_zoom } from '../../utils/cookies';
import { LoginPanel } from '../../components/LoginPanel';
import { useIsMobile } from '../../utils/hooks';
import { MapTilesSwitcher } from '../../components/MapTilesSwitcher';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const DEFAULT_LAT_LNG = [36.016142, 137.990904];
  const DEFAULT_ZOOM = 5;

  // let currentId: string = params.id as string;
  const [currentTileMap, setCurrentTileMap] = useState('blank');
  const [layers, setLayers] = useState({
    pref: true,
    muni: true,
    sinkoukyoku: true,
    placename: true,
    railways: true,
  });
  const [prefBorderData, setprefBorderData]: [Prefecture[], any] = useState([]);
  const [shinkouBorderData, setshinkouBorderData]: [Prefecture[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [Railway[], any] = useState([]);
  const [muniBorderData, setmuniBorderData]: [{ municipalities: Municipality[]; prefecture: string }[], any] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : DEFAULT_ZOOM);

  const [recordGroup, setrecordGroup] = useState<RecordGroup>();
  const [records, setrecords] = useState<Record[]>([]);

  const [isGroupListModalOpen, setIsGroupListModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);
  const [currentMapStyle, setcurrentMapStyle] = useState(2);

  const showTodofukenLevelColor = useMemo(() => layers.pref && !layers.muni, [layers.pref, layers.muni]);

  const showSubprefectureLevelColor = useMemo(() => layers.pref && layers.sinkoukyoku && !layers.muni, [layers.pref, layers.muni]);

  const thisMapId = MapsId.JapanMuni;

  const refreshRecordGroups = () => {
    if (isLogin()) {
      getRecordGroups(
        thisMapId,
        (data: any) => {
          if (data && data.length > 0) {
            setrecordGroup(data[0]);
          }
        },
        errmsg => {
          alert(errmsg);
        }
      );
    }
  };

  const refreshRecords = () => {
    console.log(isLogin(), recordGroup?.id, isLogin() && recordGroup?.id);
    if (isLogin() && recordGroup?.id) {
      getRecords(
        recordGroup?.id,
        (data: any) => {
          console.log(data);
          if (data) {
            setrecords(data);
          }
        },
        errmsg => {
          alert(errmsg);
        }
      );
    }
  };

  useEffect(() => {
    (async () => {
      setprefBorderData(await getPrefecture_ShinkoukyokuData());
      setshinkouBorderData(await getPrefecture_ShinkoukyokuData(true));
      setmuniBorderData(await getMunicipalitiesData());
      setrailwaysData(await getRailwaysData());
    })();
    refreshRecordGroups();
    refreshRecords();
  }, []);

  useEffect(() => {
    refreshRecords();
  }, [recordGroup?.id]);

  const handleMapTileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        c_zoom(map.getZoom().toString());
        setCurrentZoom(map.getZoom());
        console.log(map.getZoom());
      },
    });
    return null;
  };

  const MapCenterTracker = () => {
    useMapEvents({
      moveend: e => {
        const map = e.target;
        setcurrentLatLng([map.getCenter().lat, map.getCenter().lng]);
        c_lat(currentLatLng[0].toString());
        c_lng(currentLatLng[1].toString());
      },
    });
    return null;
  };

  const PaneSetter = () => {
    const map = useMap();

    useEffect(() => {
      if (map.getPane('muni') === undefined) {
        map.createPane('base');
        map.createPane('muni');
        map.createPane('pref');
        map.createPane('subpref');
        map.createPane('railways');
        map.createPane('muniNames');
        map.getPane('base')!.style.zIndex = '90';
        map.getPane('muni')!.style.zIndex = '95';
        map.getPane('pref')!.style.zIndex = '96';
        map.getPane('subpref')!.style.zIndex = '97';
        map.getPane('railways')!.style.zIndex = '98';
        map.getPane('muniNames')!.style.zIndex = '99';
      }
    }, []);

    return null;
  };

  const MuniNameMarker = useCallback(
    ({
      center,
      muniBorder,
      currentZoom,
      layers,
    }: {
      center: LatLngTuple;
      muniBorder: Municipality;
      currentZoom: number;
      layers: {
        pref: boolean;
        muni: boolean;
        sinkoukyoku: boolean;
        placename: boolean;
        railways: boolean;
      };
    }) => {
      const map = useMap();
      const isInView = (() => {
        const bounds = map.getBounds();
        const point = L.latLng(center[0], center[1]);
        return bounds.contains(point);
      })();

      if (!(currentZoom >= 8 && layers.placename && isInView)) return null;

      return (
        <Marker
          pane="muniNames"
          position={center}
          icon={divIcon({
            className: 'munilabels',
            html: `<span class="munilabels-specialCityName">${muniBorder.is_special_city_ward ? muniBorder.gun_seireishi : ''}</span><br /><span>${muniBorder.name}</span>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          })}
        />
      );
    },
    [currentZoom, currentLatLng, layers]
  );

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex' }}>
      <aside
        style={{
          boxShadow: '0px 0px 10px 0px rgb(136, 136, 136)',
          zIndex: 3500,
          position: isMobile ? 'absolute' : 'unset',
          display: (isMobile && props.openMobileAsideMenu) || !isMobile ? 'unset' : 'none',
        }}
      >
        <div>
          <MapTilesSwitcher currentTileMap={currentTileMap} onChange={handleMapTileChange} />
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
        {isLogin() ? (
          <div className="groupSwitchContainer">
            <div style={{ width: '100%', padding: '4px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              {recordGroup && (
                <>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <p>記録名:{recordGroup.name}</p>
                    <p style={{ color: 'gray', fontSize: '12px', height: 'fit-content', alignSelf: 'end' }}>{recordGroup.desc}</p>
                  </div>
                  <time style={{ color: 'gray', fontSize: '10px', display: 'flex', gap: '10px' }}>
                    <span>{`作成 ${moment(recordGroup.create_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                    <span>{`最後更新 ${moment(recordGroup.update_date).format('YYYY/MM/DD HH:mm:ss')}`}</span>
                  </time>
                </>
              )}
            </div>
            <button className="styled-button flex" onClick={() => setIsGroupListModalOpen(true)} style={{ borderRight: 'none', borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
                />
              </svg>
              {recordGroup ? '記録切り替え' : '記録を開く'}
            </button>
            <button className="styled-button flex" onClick={() => setIsNewGroupModalOpen(true)} style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
              新規記録地図
            </button>
          </div>
        ) : (
          <LoginPanel />
        )}

        {recordGroup && <MuniList muniBorderData={muniBorderData} records={records} currentMapStyle={currentMapStyle} />}
        <GroupListModal
          mapid={thisMapId}
          show={isGroupListModalOpen}
          onClose={() => setIsGroupListModalOpen(false)}
          onSelect={(recordGroup: RecordGroup) => {
            setrecordGroup(recordGroup);
            setIsGroupListModalOpen(false);
          }}
        />
        <NewGroupModal
          show={isNewGroupModalOpen}
          onClose={() => setIsNewGroupModalOpen(false)}
          onOk={(name: string, desc: string, isPublic: boolean, showLivedLevel: boolean) => {
            postRecordGroup(
              thisMapId,
              name,
              desc,
              isPublic,
              showLivedLevel,
              (data: any) => {
                setIsNewGroupModalOpen(false);
              },
              errmsg => {
                alert(errmsg);
              }
            );
          }}
        />
      </aside>

      <MapContainer
        center={[c_lat() ? Number(c_lat()) : DEFAULT_LAT_LNG[0], c_lng() ? Number(c_lng()) : DEFAULT_LAT_LNG[1]]}
        zoom={currentZoom}
        scrollWheelZoom={true}
        attributionControl={false}
        className="mapContainer"
      >
        <ZoomListener />
        <MapCenterTracker />
        <PaneSetter />
        <ScaleControl position="bottomleft" />
        <AttributionControl position="bottomright" prefix={'Dev by <a href="https://github.com/elpwc" target="_blank">@elpwc</a>'} />
        <TileLayer
          pane="base"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapTiles.find(tile => tile.id === currentTileMap)?.url || mapTiles[0].url}
        />
        {
          /* 市区町村 */
          layers.muni &&
            muniBorderData.map(prefMuniBorder => {
              return prefMuniBorder.municipalities.map((muniBorder: Municipality) => {
                // 计算中心点
                const center = getBounds(muniBorder.coordinates);

                return (
                  <Polygon
                    pane="muni"
                    key={muniBorder.id}
                    className="muniBorder"
                    pathOptions={{
                      fillColor: getFillcolor(currentMapStyle, records, muniBorder.id),
                      color: getForecolor(currentMapStyle, records, muniBorder.id),
                      opacity: 1,
                      fillOpacity: currentTileMap !== 'blank' ? 0.6 : 1,
                      weight: 0.4,
                    }}
                    positions={muniBorder.coordinates}
                  >
                    <Popup closeOnClick className="popupStyle">
                      <MapPopup
                        addr={(muniBorder.pref ?? '') + (muniBorder.shinkoukyoku ?? '') + (muniBorder.gun_seireishi ?? '')}
                        name={muniBorder.name}
                        onClick={value => {
                          if (recordGroup?.id) {
                            postRecord(
                              recordGroup?.id,
                              muniBorder.id,
                              value,
                              () => {
                                refreshRecords();
                              },
                              errmsg => {
                                alert(errmsg);
                              }
                            );
                          }
                        }}
                      />
                    </Popup>
                    <MuniNameMarker center={center as LatLngTuple} muniBorder={muniBorder} currentZoom={currentZoom} layers={layers} />
                  </Polygon>
                );
              });
            })
        }
        {
          /* 铁道 */
          layers.railways &&
            railwaysData.map(railwayLines => {
              return railwayLines.railwayClassCd === RailwayClassCd.NormalRailwayJR ? (
                <>
                  {/* 铁道底色 */}
                  <Polyline
                    pane="railways"
                    positions={railwayLines.coordinates}
                    pathOptions={{ weight: 3, color: railwayLines.institutionTypeCd === InstitutionTypeCd.JRShinkansen ? '#037771' : '#4f4f4f', opacity: 1, fillOpacity: 1 }}
                  />
                  {/* 白线 */}
                  <Polyline pane="railways" positions={railwayLines.coordinates} pathOptions={{ weight: 1.5, color: 'white', opacity: 1, fillOpacity: 1, dashArray: '10,10', dashOffset: '10' }} />
                </>
              ) : (
                <Polyline className="rail-line" pane="railways" positions={railwayLines.coordinates} pathOptions={{ weight: 1, color: 'darkred', opacity: 1, fillOpacity: 1 }} />
              );
            })
        }
        {
          /* 都道府县 */
          layers.pref &&
            prefBorderData.map((prefBorder: Prefecture) => {
              // 计算中心点
              const center = getBounds(prefBorder.coordinates);
              return (
                <Polygon
                  pane="pref"
                  pathOptions={{
                    fillColor: showTodofukenLevelColor ? getTodofukenFillColor(currentMapStyle, records, prefBorder.id) : '#ffffff',
                    opacity: 1,
                    fillOpacity: showTodofukenLevelColor ? (currentTileMap !== 'blank' ? 0.6 : 1) : 0,
                    weight: 0.7,
                    color: showTodofukenLevelColor ? getTodofukenForeColor(currentMapStyle, records, prefBorder.id) : 'black',
                  }}
                  positions={prefBorder.coordinates}
                  interactive={false}
                >
                  {(showTodofukenLevelColor || (currentZoom < 8 && layers.placename)) && (
                    <Marker
                      pane="muniNames"
                      position={center as LatLngTuple}
                      icon={divIcon({
                        className: 'munilabels',
                        html: `<p class="placeNameLabel">${prefBorder.name}</p>`,
                        iconSize: [60, 20],
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
                <Polygon
                  pane="subpref"
                  pathOptions={{
                    fillColor: showTodofukenLevelColor && showSubprefectureLevelColor ? getShinkoukyokuFillColor(currentMapStyle, records, muniBorderData, shinkouBorder.name) : '#ffffff',
                    opacity: 1,
                    fillOpacity: showTodofukenLevelColor && showSubprefectureLevelColor ? (currentTileMap !== 'blank' ? 0.6 : 1) : 0,
                    weight: 0.7,
                    color: showTodofukenLevelColor && showSubprefectureLevelColor ? getShinkoukyokuForeColor(currentMapStyle, records, muniBorderData, shinkouBorder.name) : 'black',
                  }}
                  positions={shinkouBorder.coordinates}
                  interactive={false}
                >
                  {((showTodofukenLevelColor && showSubprefectureLevelColor) || (currentZoom < 8 && layers.placename)) && (
                    <Marker
                      pane="muniNames"
                      position={center as LatLngTuple}
                      icon={divIcon({
                        className: 'munilabels',
                        html: `<span class="placeNameLabel">${shinkouBorder.name}</span>`,
                        iconSize: [60, 20],
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
