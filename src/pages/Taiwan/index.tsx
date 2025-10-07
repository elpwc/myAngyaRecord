import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { Marker, Polygon, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { getBounds, MapsId } from '../../utils/map';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import { getCurrentFillColorByRecords, getCurrentForeColorByRecords, getRecordGroupById, getRecordGroups, getRecords, postRecord } from '../../utils/serverUtils';
import { Record, RecordGroup } from '../../utils/types';
import { isLogin } from '../../utils/userUtils';
import { c_uid, c_zoom } from '../../utils/cookies';
import { useIsMobile } from '../../utils/hooks';
import { AsideBar, LayerCheckboxInfo } from '../../components/AppCompo/AsideBar';
import { MapInstance } from '../../components/AppCompo/MapInstance';
import { getRailwaysData, getTaiwanCountyData, getTaiwanTownData } from './geojsonUtils';
import { getAreaFillColor, getAreaForeColor } from './utils';
import MuniList from './MuniList';
import { useAppContext } from '../../context';
import { TaiwanCounty, TaiwanTown } from './addr';
import { PrivateRailwayLineStyle, Railway, RailwayType } from '../../utils/mapInfo';
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

  const DEFAULT_LAT_LNG: [number, number] = [23.618074034239307, 120.77147081162761];
  const DEFAULT_ZOOM = 8;

  const [isViewMode, setIsViewMode] = useState(false);
  const [layers, setLayers] = useState({
    county: true,
    town: true,
    placename: true,
    railways: true,
  });
  const [areaBorderData, setareaBorderData]: [TaiwanCounty[], any] = useState([]);
  const [ooazaBorderData, setooazaBorderData]: [TaiwanTown[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [Railway[], any] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : DEFAULT_ZOOM);

  const { currentRecordGroup, setCurrentRecordGroup } = useAppContext();
  const [records, setrecords] = useState<Record[]>([]);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);

  const { currentBackgroundTileMap, setCurrentBackgroundTileMap } = useAppContext();
  const { privateRailwayLineStyle, setPrivateRailwayLineStyle } = useAppContext();

  // 連続塗り関連
  const { isContinuousEditOn, setIsContinuousEditOn } = useAppContext();
  const { currentContinuousEditValue, setCurrentContinuousEditValue } = useAppContext();

  const showCountyLevelColor = useMemo(() => layers.county && !layers.town, [layers.county, layers.town]);

  const thisMapId = MapsId.Taiwan;

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

  const refreshRecords = () => {
    if (isLogin() && currentRecordGroup?.id) {
      getRecords(
        currentRecordGroup?.id,
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
      setareaBorderData(await getTaiwanCountyData());
      setooazaBorderData(await getTaiwanTownData());
      setrailwaysData(await getRailwaysData());
    })();
    refreshRecordGroups();
    refreshRecords();
  }, []);

  // param.id
  useEffect(() => {
    if (currentRecordGroupId !== '-1') {
      console.log(currentRecordGroupId);
      getRecordGroupById(
        Number(currentRecordGroupId),
        (data: RecordGroup[]) => {
          if (data && data[0].mapid === thisMapId) {
            setCurrentRecordGroup(data[0]);
            if (data[0].uid !== Number(c_uid())) {
              setIsViewMode(true);
            }
            getRecords(
              Number(currentRecordGroupId),
              (recordsData: Record[]) => {
                setrecords(recordsData);
              },
              errmsg => {
                alert(errmsg);
              }
            );
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

  const PANES = ['town', 'county', 'railways', 'muniNames'];

  const MuniNameMarker = useCallback(
    ({
      center,
      muniBorder,
      currentZoom,
      layers,
    }: {
      center: LatLngTuple;
      muniBorder: TaiwanTown;
      currentZoom: number;
      layers: {
        county: boolean;
        town: boolean;
        placename: boolean;
      };
    }) => {
      const map = useMap();
      const isInView = (() => {
        const bounds = map.getBounds();
        const point = L.latLng(center[0], center[1]);
        return bounds.contains(point);
      })();

      if (!(currentZoom >= 9 && layers.placename && isInView)) return null;
      return (
        <Marker
          pane="muniNames"
          position={center}
          icon={divIcon({
            className: 'munilabels',
            html: `<p class="pnl">${muniBorder.name + ((records.find(r => r.admin_id === muniBorder.id)?.comment ?? '') !== '' ? '*' : '')}</p>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          })}
        />
      );
    },
    [currentZoom, currentLatLng, layers]
  );

  const LAYERS: LayerCheckboxInfo[] = [
    { name: 'county', title: '県市境界', checked: layers.county },
    { name: 'town', title: '郷境界', checked: layers.town },
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
        list={<MuniList townData={ooazaBorderData} countyData={areaBorderData} records={records} onChangeStatus={changeRecordStatus} isViewMode={isViewMode} />}
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
        doSaveLatLngToCookies={false}
        doSaveZoomToCookies={false}
        tileList={
          <>
            {
              /* 郷 */
              layers.town &&
                ooazaBorderData.map((border: TaiwanTown) => {
                  // 计算中心点
                  const center = getBounds(border.coordinates);

                  return (
                    <Polygon
                      pane="town"
                      key={border.id}
                      className="muniBorder"
                      pathOptions={{
                        fillColor: getCurrentFillColorByRecords(records, border.id),
                        color: getCurrentForeColorByRecords(records, border.id),
                        opacity: 1,
                        fillOpacity: currentBackgroundTileMap !== 'blank' ? 0.6 : 1,
                        weight: 0.4,
                      }}
                      positions={border.coordinates}
                      eventHandlers={{
                        // https://github.com/PaulLeCam/react-leaflet/issues/899
                        click: e => {
                          if (isContinuousEditOn) {
                            changeRecordStatus(border.id, currentContinuousEditValue);
                          }
                        },
                      }}
                    >
                      {!isContinuousEditOn && (
                        <Popup closeOnClick className="popupStyle">
                          <MapPopup
                            addr={border.countyCode ? border.countyCode + '地区' : ''}
                            name={border.name}
                            comment={records.find(r => r.admin_id === border.id)?.comment ?? ''}
                            recordId={records.find(r => r.admin_id === border.id)?.id}
                            groupId={currentRecordGroup?.id ?? 0}
                            adminId={border.id}
                            hasOpenningRecordGroup={!!currentRecordGroup?.id}
                            selected={records.find(r => r.admin_id === border.id)?.level ?? -1}
                            isViewMode={isViewMode}
                            onClick={value => {
                              changeRecordStatus(border.id, value);
                            }}
                          />
                        </Popup>
                      )}
                      <MuniNameMarker center={center as LatLngTuple} muniBorder={border} currentZoom={currentZoom} layers={layers} />
                      {(records.find(r => r.admin_id === border.id)?.comment ?? '') !== '' && <Tooltip>{records.find(r => r.admin_id === border.id)?.comment ?? ''}</Tooltip>}
                    </Polygon>
                  );
                })
            }
            {
              /* 県市 */
              layers.county &&
                areaBorderData.map((border: TaiwanCounty) => {
                  // 计算中心点
                  const center = getBounds(border.coordinates);
                  return (
                    <Polygon
                      key={border.id}
                      pane="county"
                      pathOptions={{
                        fillColor: showCountyLevelColor ? getAreaFillColor(ooazaBorderData, records, border.id) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showCountyLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
                        weight: 0.7,
                        color: showCountyLevelColor ? getAreaForeColor(ooazaBorderData, records, border.id) : 'black',
                      }}
                      positions={border.coordinates}
                      interactive={false}
                    >
                      {((showCountyLevelColor && layers.placename) || (currentZoom < 9 && layers.placename)) && (
                        <Marker
                          pane="muniNames"
                          position={center as LatLngTuple}
                          icon={divIcon({
                            className: 'munilabels',
                            html: `<p class="pnl">${border.name}</p>`,
                            iconSize: [60, 20],
                          })}
                        />
                      )}
                    </Polygon>
                  );
                })
            }
            {
              /* 铁道 */
              layers.railways &&
                railwaysData.map((railwayLines, index) => {
                  return railwayLines.type === RailwayType.highSpeedRailway || railwayLines.type === RailwayType.railway ? (
                    <>
                      {/* 铁道底色 */}
                      <Polyline
                        key={railwayLines.lineName + index.toString() + '1'}
                        pane="railways"
                        positions={railwayLines.coordinates}
                        pathOptions={{ weight: 3, color: railwayLines.type === RailwayType.highSpeedRailway ? '#037771' : '#4f4f4f', opacity: 1, fillOpacity: 1 }}
                      />
                      {/* 白线 */}
                      <Polyline
                        key={railwayLines.lineName + index.toString() + '2'}
                        pane="railways"
                        positions={railwayLines.coordinates}
                        pathOptions={{ weight: 1.5, color: 'white', opacity: 1, fillOpacity: 1, dashArray: '10,10', dashOffset: '10' }}
                      />
                    </>
                  ) : railwayLines.type === RailwayType.private ? (
                    privateRailwayLineStyle === PrivateRailwayLineStyle.PlusLine ? (
                      <RailwayPolyline key={railwayLines.lineName + index.toString()} latlngs={railwayLines.coordinates} type={0} />
                    ) : privateRailwayLineStyle === PrivateRailwayLineStyle.RedLine ? (
                      <Polyline
                        key={railwayLines.lineName + railwayLines.lineName + index.toString()}
                        className="rail-line"
                        pane="railways"
                        positions={railwayLines.coordinates}
                        pathOptions={{ weight: 1, color: 'darkred', opacity: 1, fillOpacity: 1 }}
                      />
                    ) : (
                      <></>
                    )
                  ) : (
                    <Polyline
                      key={railwayLines.lineName + index.toString()}
                      className="rail-line"
                      pane="railways"
                      positions={railwayLines.coordinates}
                      pathOptions={{ weight: 1, color: railwayLines.type === RailwayType.metro ? '#1f7197ff' : '#7ab652ff', opacity: 1, fillOpacity: 1 }}
                    />
                  );
                })
            }
          </>
        }
      />
    </div>
  );
};
