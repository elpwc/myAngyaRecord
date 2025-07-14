import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { Marker, Polygon, Polyline, Popup, useMap } from 'react-leaflet';
import { getBounds, MapsId } from '../../utils/map';
import { getMunicipalitiesData, getPrefecture_ShinkoukyokuData, getRailwaysData } from './geojsonUtils';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import { getFillcolor, getForecolor, getRecordGroups, getRecords, postRecord } from '../../utils/serverUtils';
import MuniList from './MuniList';
import { Record, RecordGroup } from '../../utils/types';
import { isLogin } from '../../utils/userUtils';
import { useIsMobile } from '../../utils/hooks';
import { AsideBar, LayerCheckboxInfo } from '../../components/AsideBar';
import { MapInstance } from '../../components/MapInstance';
import { InstitutionTypeCd, JapanRailway, Municipality, Prefecture, RailwayClassCd } from './addr';
import { getShinkoukyokuFillColor, getShinkoukyokuForeColor, getTodofukenFillColor, getTodofukenForeColor } from './utils';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const DEFAULT_LAT_LNG: [number, number] = [36.016142, 137.990904];
  const DEFAULT_ZOOM = 5;

  // let currentId: string = params.id as string;
  const [currentBackgroundTileMap, setcurrentBackgroundTileMap] = useState('blank');
  const [layers, setLayers] = useState({
    pref: true,
    muni: true,
    //ryouseikoku: true,
    sinkoukyoku: true,
    placename: true,
    railways: true,
  });
  const [prefBorderData, setprefBorderData]: [Prefecture[], any] = useState([]);
  const [shinkouBorderData, setshinkouBorderData]: [Prefecture[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [JapanRailway[], any] = useState([]);
  const [muniBorderData, setmuniBorderData]: [{ municipalities: Municipality[]; prefecture: string }[], any] = useState([]);

  const [muniListSelectedPrefectures, setMuniListSelectedPrefectures] = useState<string[]>([]);

  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  const [recordGroup, setrecordGroup] = useState<RecordGroup>();
  const [records, setrecords] = useState<Record[]>([]);

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
    if (isLogin() && recordGroup?.id) {
      getRecords(
        recordGroup?.id,
        (data: any) => {
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

  const handleMapBackgroundTileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setcurrentBackgroundTileMap(e.target.value);
  };

  const handleLayerChange = (name: string, checked: boolean) => {
    setLayers(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const PANES = ['muni', 'pref', 'subpref', 'railways', 'muniNames'];

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

  const LAYERS: LayerCheckboxInfo[] = [
    { name: 'pref', title: '都道府県表示', checked: layers.pref },
    { name: 'muni', title: '市区町村表示', checked: layers.muni },
    // { name: 'ryouseikoku', title: '令制国表示', checked: layers.ryouseikoku },
    { name: 'sinkoukyoku', title: '北海道振興局表示', checked: layers.sinkoukyoku },
    { name: 'placename', title: '地名表示', checked: layers.placename },
    { name: 'railways', title: '全国鉄道路線', checked: layers.railways },
  ];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex' }}>
      <AsideBar
        currentRecordGroup={recordGroup}
        thisMapId={thisMapId}
        openMobileAsideMenu={props.openMobileAsideMenu}
        currentTileMap={currentBackgroundTileMap}
        layers={LAYERS}
        list={
          <MuniList
            muniBorderData={muniBorderData}
            records={records}
            currentMapStyle={currentMapStyle}
            showCheckbox={LAYERS.some(layer => layer.checked && layer.name === 'muni')}
            onSelectedPrefChanged={setMuniListSelectedPrefectures}
          />
        }
        onCurrentBackgroundTileMapChange={handleMapBackgroundTileChange}
        onLayerChange={handleLayerChange}
        onSelectRecordGroup={(recordGroup: RecordGroup) => {
          setrecordGroup(recordGroup);
        }}
      />

      <MapInstance
        defaultLatLng={DEFAULT_LAT_LNG}
        defaultZoom={DEFAULT_ZOOM}
        backgroundTile={currentBackgroundTileMap}
        panes={PANES}
        onZoom={setCurrentZoom}
        onMove={setcurrentLatLng}
        tileList={
          <>
            {
              /* 市区町村 */
              layers.muni &&
                muniBorderData
                  .filter(prefMuniBorder => {
                    if (muniListSelectedPrefectures.length === 0) {
                      return true;
                    }
                    return muniListSelectedPrefectures.includes(prefMuniBorder.prefecture);
                  })
                  .map(prefMuniBorder => {
                    return prefMuniBorder.municipalities.map((muniBorder: Municipality) => {
                      // 计算中心点
                      const center = getBounds(muniBorder.coordinates);

                      return (
                        <Polygon
                          pane="muni"
                          key={'muni' + muniBorder.id}
                          className="muniBorder"
                          pathOptions={{
                            fillColor: getFillcolor(currentMapStyle, records, muniBorder.id),
                            color: getForecolor(currentMapStyle, records, muniBorder.id),
                            opacity: 1,
                            fillOpacity: currentBackgroundTileMap !== 'blank' ? 0.6 : 1,
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
                railwaysData.map((railwayLines, index) => {
                  return railwayLines.railwayClassCd === RailwayClassCd.NormalRailwayJR ? (
                    <>
                      {/* 铁道底色 */}
                      <Polyline
                        key={railwayLines.companyName + railwayLines.lineName + index.toString() + '1'}
                        pane="railways"
                        positions={railwayLines.coordinates}
                        pathOptions={{ weight: 3, color: railwayLines.institutionTypeCd === InstitutionTypeCd.JRShinkansen ? '#037771' : '#4f4f4f', opacity: 1, fillOpacity: 1 }}
                      />
                      {/* 白线 */}
                      <Polyline
                        key={railwayLines.companyName + railwayLines.lineName + index.toString() + '2'}
                        pane="railways"
                        positions={railwayLines.coordinates}
                        pathOptions={{ weight: 1.5, color: 'white', opacity: 1, fillOpacity: 1, dashArray: '10,10', dashOffset: '10' }}
                      />
                    </>
                  ) : (
                    <Polyline
                      key={railwayLines.companyName + railwayLines.lineName + index.toString()}
                      className="rail-line"
                      pane="railways"
                      positions={railwayLines.coordinates}
                      pathOptions={{ weight: 1, color: 'darkred', opacity: 1, fillOpacity: 1 }}
                    />
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
                      key={'pref' + prefBorder.id}
                      pathOptions={{
                        fillColor: showTodofukenLevelColor ? getTodofukenFillColor(currentMapStyle, records, prefBorder.id) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showTodofukenLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
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
                      key={'subpref' + shinkouBorder.id}
                      pathOptions={{
                        fillColor: showTodofukenLevelColor && showSubprefectureLevelColor ? getShinkoukyokuFillColor(currentMapStyle, records, muniBorderData, shinkouBorder.name) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showTodofukenLevelColor && showSubprefectureLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
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
          </>
        }
      />
    </div>
  );
};
