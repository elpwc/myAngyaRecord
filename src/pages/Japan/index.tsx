import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { Marker, Polygon, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { getBounds, MapsId } from '../../utils/map';
import { getMunicipalitiesData, getPrefecture_ShinkoukyokuData, getRailwaysData } from './geojsonUtils';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import { getCurrentFillColorByRecords, getCurrentForeColorByRecords, getRecordGroupById, getRecordGroups, getRecords, postRecord } from '../../utils/serverUtils';
import MuniList from './MuniList';
import { PrivateRailwayLineStyle, Record, RecordGroup } from '../../utils/types';
import { isLogin } from '../../utils/userUtils';
import { useIsMobile } from '../../utils/hooks';
import { AsideBar, LayerCheckboxInfo } from '../../components/AsideBar';
import { MapInstance } from '../../components/MapInstance';
import { InstitutionTypeCd, JapanRailway, Municipality, Prefecture, RailwayClassCd } from './addr';
import { getShinkoukyokuFillColor, getShinkoukyokuForeColor, getTodofukenFillColor, getTodofukenForeColor } from './utils';
import { c_uid } from '../../utils/cookies';
import { useAppContext } from '../../context';
import { RailwayPolyline } from '../../components/MapContents/RailwayPolyline';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const currentRecordGroupId = params.id || '-1';

  const DEFAULT_LAT_LNG: [number, number] = [36.016142, 137.990904];
  const DEFAULT_ZOOM = 5;

  const [layers, setLayers] = useState({
    pref: true,
    muni: true,
    //ryouseikoku: true,
    sinkoukyoku: true,
    placename: true,
    railways: true,
  });
  const [isViewMode, setIsViewMode] = useState(false);
  const [prefBorderData, setprefBorderData]: [Prefecture[], any] = useState([]);
  const [shinkouBorderData, setshinkouBorderData]: [Prefecture[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [JapanRailway[], any] = useState([]);
  const [muniBorderData, setmuniBorderData]: [{ municipalities: Municipality[]; prefecture: string }[], any] = useState([]);

  const [muniListSelectedPrefectures, setMuniListSelectedPrefectures] = useState<string[]>([]);

  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  const { currentRecordGroup, setCurrentRecordGroup } = useAppContext();
  const [records, setrecords] = useState<Record[]>([]);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);

  const { currentBackgroundTileMap, setCurrentBackgroundTileMap } = useAppContext();
  const { privateRailwayLineStyle, setPrivateRailwayLineStyle } = useAppContext();

  // 連続塗り関連
  const { isContinuousEditOn, setIsContinuousEditOn } = useAppContext();
  const { currentContinuousEditValue, setCurrentContinuousEditValue } = useAppContext();

  const showTodofukenLevelColor = useMemo(() => layers.pref && !layers.muni, [layers.pref, layers.muni]);

  const showSubprefectureLevelColor = useMemo(() => layers.pref && layers.sinkoukyoku && !layers.muni, [layers.pref, layers.muni]);

  const thisMapId = MapsId.JapanMuni;

  const refreshRecordGroups = () => {
    if (isLogin()) {
      getRecordGroups(
        thisMapId,
        (data: any) => {
          if (data && data.length > 0) {
            setCurrentRecordGroup(data[0]);
          }
        },
        errmsg => {
          alert(errmsg);
        }
      );
    }
  };

  const refreshRecords = (
    id: number | undefined = currentRecordGroup?.id,
    show_lived_level: boolean = !(isLogin() && c_uid() === currentRecordGroup?.uid.toString()) && (currentRecordGroup?.show_lived_level ?? false)
  ) => {
    if (id) {
      getRecords(
        id,
        (data: Record[]) => {
          if (data) {
            if (show_lived_level) {
              setrecords(
                data.map(record => {
                  if (record.level === 5) {
                    return { ...record, level: 4 };
                  } else {
                    return record;
                  }
                })
              );
            } else {
              setrecords(data);
            }
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

  // param.id
  useEffect(() => {
    if (currentRecordGroupId !== '-1') {
      getRecordGroupById(
        Number(currentRecordGroupId),
        (data: RecordGroup[]) => {
          if (data && data[0].mapid === thisMapId) {
            setCurrentRecordGroup(data[0]);
            if (data[0].uid !== Number(c_uid()) || !isLogin()) {
              console.log(data[0].uid !== Number(c_uid()) || !isLogin());
              setIsViewMode(true);
            }
            refreshRecords(Number(currentRecordGroupId), data[0].show_lived_level);
          }
        },
        (errmsg: any) => {
          alert(errmsg);
        }
      );
    }
  }, [currentRecordGroupId]);

  useEffect(() => {
    refreshRecords();
  }, [currentRecordGroup?.id]);

  const handleMapBackgroundTileChange = (id: string) => {
    setCurrentBackgroundTileMap(id);
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
            html: `<span class="munilabels-specialCityName">${muniBorder.is_special_city_ward ? muniBorder.gun_seireishi : ''}</span><br /><span>${
              muniBorder.name + ((records.find(r => r.admin_id === muniBorder.id)?.comment ?? '') !== '' ? '*' : '')
            }</span>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          })}
        />
      );
    },
    [currentZoom, currentLatLng, layers]
  );

  const LAYERS: LayerCheckboxInfo[] = [
    { name: 'pref', title: '都道府県界', checked: layers.pref },
    { name: 'muni', title: '市区町村界', checked: layers.muni },
    // { name: 'ryouseikoku', title: '令制国界', checked: layers.ryouseikoku },
    { name: 'sinkoukyoku', title: '北海道振興局界', checked: layers.sinkoukyoku },
    { name: 'placename', title: '地名表示', checked: layers.placename },
    { name: 'railways', title: '鉄道路線', checked: layers.railways },
  ];

  /**
   * 对DB中的自治体行脚记录进行修改
   * @param muniId
   * @param status
   */
  const changeRecordStatus = (muniId: string, status: number) => {
    if (currentRecordGroup?.id) {
      postRecord(
        currentRecordGroup?.id,
        muniId,
        status,
        '',
        () => {
          refreshRecords();
        },
        errmsg => {
          refreshRecords();
          alert(errmsg);
        }
      );
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex' }}>
      <AsideBar
        currentRecordGroup={currentRecordGroup}
        thisMapId={thisMapId}
        openMobileAsideMenu={props.openMobileAsideMenu}
        currentTileMap={currentBackgroundTileMap}
        layers={LAYERS}
        isViewMode={isViewMode}
        list={
          <MuniList
            muniBorderData={muniBorderData}
            records={records}
            showCheckbox={LAYERS.some(layer => layer.checked && layer.name === 'muni')}
            isViewMode={isViewMode}
            onSelectedPrefChanged={setMuniListSelectedPrefectures}
            onChangeStatus={changeRecordStatus}
          />
        }
        onCurrentBackgroundTileMapChange={handleMapBackgroundTileChange}
        onLayerChange={handleLayerChange}
        onSelectRecordGroup={(currentRecordGroup: RecordGroup) => {
          setCurrentRecordGroup(currentRecordGroup);
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
                            fillColor: getCurrentFillColorByRecords(records, muniBorder.id),
                            color: getCurrentForeColorByRecords(records, muniBorder.id),
                            opacity: 1,
                            fillOpacity: currentBackgroundTileMap !== 'blank' ? 0.6 : 1,
                            weight: 0.4,
                          }}
                          positions={muniBorder.coordinates}
                          eventHandlers={{
                            // https://github.com/PaulLeCam/react-leaflet/issues/899
                            click: e => {
                              if (isContinuousEditOn) {
                                changeRecordStatus(muniBorder.id, currentContinuousEditValue);
                              }
                            },
                          }}
                        >
                          {!isContinuousEditOn && (
                            <Popup closeOnClick className="popupStyle">
                              <MapPopup
                                addr={(muniBorder.pref ?? '') + (muniBorder.shinkoukyoku ?? '') + (muniBorder.gun_seireishi ?? '')}
                                name={muniBorder.name}
                                comment={records.find(r => r.admin_id === muniBorder.id)?.comment ?? ''}
                                recordId={records.find(r => r.admin_id === muniBorder.id)?.id}
                                groupId={currentRecordGroup?.id ?? 0}
                                adminId={muniBorder.id}
                                hasOpenningRecordGroup={!!currentRecordGroup?.id}
                                selected={records.find(r => r.admin_id === muniBorder.id)?.level ?? -1}
                                isViewMode={isViewMode}
                                onClick={value => {
                                  changeRecordStatus(muniBorder.id, value);
                                }}
                              />
                            </Popup>
                          )}

                          <MuniNameMarker center={center as LatLngTuple} muniBorder={muniBorder} currentZoom={currentZoom} layers={layers} />
                          {(records.find(r => r.admin_id === muniBorder.id)?.comment ?? '') !== '' && <Tooltip>{records.find(r => r.admin_id === muniBorder.id)?.comment ?? ''}</Tooltip>}
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
                    // JR
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
                  ) : railwayLines.companyName.includes('地下鉄') ||
                    railwayLines.companyName.includes('メトロ') ||
                    ['東京都', '名古屋市', '大阪市高速電気軌道', '札幌市', '仙台市', '横浜市', '京都市', '神戸市', '福岡市'].includes(railwayLines.companyName) ? (
                    // 地下鉄
                    <Polyline
                      key={railwayLines.companyName + railwayLines.lineName + index.toString()}
                      className="rail-line"
                      pane="railways"
                      positions={railwayLines.coordinates}
                      pathOptions={{ weight: 1, color: '#1f7197ff', opacity: 1, fillOpacity: 1 }}
                    />
                  ) : // 私鉄
                  privateRailwayLineStyle === PrivateRailwayLineStyle.PlusLine ? (
                    <RailwayPolyline key={railwayLines.companyName + railwayLines.lineName + index.toString()} latlngs={railwayLines.coordinates} type={0} />
                  ) : privateRailwayLineStyle === PrivateRailwayLineStyle.RedLine ? (
                    <Polyline
                      key={railwayLines.companyName + railwayLines.lineName + index.toString()}
                      className="rail-line"
                      pane="railways"
                      positions={railwayLines.coordinates}
                      pathOptions={{ weight: 1, color: 'darkred', opacity: 1, fillOpacity: 1 }}
                    />
                  ) : (
                    <></>
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
                        fillColor: showTodofukenLevelColor ? getTodofukenFillColor(records, prefBorder.id) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showTodofukenLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
                        weight: 0.7,
                        color: showTodofukenLevelColor ? getTodofukenForeColor(records, prefBorder.id) : 'black',
                      }}
                      positions={prefBorder.coordinates}
                      interactive={false}
                    >
                      {((showTodofukenLevelColor && layers.placename) || (currentZoom < 8 && layers.placename)) && (
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
                        fillColor: showTodofukenLevelColor && showSubprefectureLevelColor ? getShinkoukyokuFillColor(records, muniBorderData, shinkouBorder.name) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showTodofukenLevelColor && showSubprefectureLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
                        weight: 0.7,
                        color: showTodofukenLevelColor && showSubprefectureLevelColor ? getShinkoukyokuForeColor(records, muniBorderData, shinkouBorder.name) : 'black',
                      }}
                      positions={shinkouBorder.coordinates}
                      interactive={false}
                    >
                      {((showTodofukenLevelColor && showSubprefectureLevelColor && layers.placename) || (currentZoom < 8 && layers.placename)) && (
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
