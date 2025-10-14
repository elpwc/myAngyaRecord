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
import { getMuniBorderData, getRailwaysData } from './geojsonUtils';
import MuniList from './MuniList';
import { Railway, RailwayType } from '../../utils/mapInfo';
import { useAppContext } from '../../context';
import { HongkongDistrict } from './addr';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const currentRecordGroupId = params.id || '-1';

  const DEFAULT_LAT_LNG: [number, number] = [22.36085452732528, 114.11768916896023];
  const DEFAULT_ZOOM = 11;
  const thisMapId = MapsId.Hongkong;

  const [isViewMode, setIsViewMode] = useState(false);
  const [layers, setLayers] = useState({
    district: true,
    railways: true,
    placename: true,
  });
  const [borderData, setBorderData]: [HongkongDistrict[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [Railway[], any] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : DEFAULT_ZOOM);

  const { currentRecordGroup, setCurrentRecordGroup } = useAppContext();
  const [records, setrecords] = useState<Record[]>([]);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);

  const { currentBackgroundTileMap, setCurrentBackgroundTileMap } = useAppContext();
  // 連続塗り関連
  const { isContinuousEditOn, setIsContinuousEditOn } = useAppContext();
  const { currentContinuousEditValue, setCurrentContinuousEditValue } = useAppContext();

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
    if (isLogin() && currentRecordGroup?.id && /* important */ currentRecordGroup?.mapid === thisMapId) {
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
      setBorderData(await getMuniBorderData());
      setrailwaysData(await getRailwaysData());
    })();
    setCurrentRecordGroup(undefined);
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

  const PANES = ['district', 'railways', 'muniNames'];

  const MuniNameMarker = useCallback(
    ({
      center,
      muniBorder,
      currentZoom,
      layers,
    }: {
      center: LatLngTuple;
      muniBorder: HongkongDistrict;
      currentZoom: number;
      layers: {
        district: boolean;
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

      return layers.placename ? (
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
      ) : (
        <></>
      );
    },
    [currentZoom, currentLatLng, layers]
  );

  const LAYERS: LayerCheckboxInfo[] = [
    { name: 'district', title: '区界', checked: layers.district },
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
        list={<MuniList borderData={borderData} records={records} isViewMode={isViewMode} onChangeStatus={changeRecordStatus} />}
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
              /* 行政区 */
              layers.district &&
                borderData.map((border: HongkongDistrict) => {
                  // 计算中心点
                  const center = getBounds(border.coordinates);

                  return (
                    <Polygon
                      pane="district"
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
                            addr={''}
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
