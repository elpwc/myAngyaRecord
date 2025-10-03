import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { Marker, Polygon, Popup, Tooltip, useMap } from 'react-leaflet';
import { getBounds, MapsId } from '../../utils/map';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import { getCurrentFillColorByRecords, getCurrentForeColorByRecords, getRecordGroupById, getRecordGroups, getRecords, postRecord } from '../../utils/serverUtils';
import { Record, RecordGroup } from '../../utils/types';
import { isLogin } from '../../utils/userUtils';
import { c_uid, c_zoom } from '../../utils/cookies';
import { useIsMobile } from '../../utils/hooks';
import { AsideBar, LayerCheckboxInfo } from '../../components/AsideBar';
import { MapInstance } from '../../components/MapInstance';
import { Ooaza, OoazaArea } from './addr';
import { getNumazuAreaData, getNumazuOoazaData } from './geojsonUtils';
import { getAreaFillColor, getAreaForeColor } from './utils';
import MuniList from './MuniList';
import { useAppContext } from '../../context';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const currentRecordGroupId = params.id || '-1';

  const DEFAULT_LAT_LNG: [number, number] = [35.07834157237541, 138.83469834814696];
  const DEFAULT_ZOOM = 12;

  const [isViewMode, setIsViewMode] = useState(false);
  const [layers, setLayers] = useState({
    area: true,
    ooaza: true,
    placename: true,
  });
  const [areaBorderData, setareaBorderData]: [OoazaArea[], any] = useState([]);
  const [ooazaBorderData, setooazaBorderData]: [Ooaza[], any] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : DEFAULT_ZOOM);

  const { currentRecordGroup, setCurrentRecordGroup } = useAppContext();
  const [records, setrecords] = useState<Record[]>([]);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);

  const { currentBackgroundTileMap, setCurrentBackgroundTileMap } = useAppContext();
  // 連続塗り関連
  const { isContinuousEditOn, setIsContinuousEditOn } = useAppContext();
  const { currentContinuousEditValue, setCurrentContinuousEditValue } = useAppContext();

  const showAreaLevelColor = useMemo(() => layers.area && !layers.ooaza, [layers.area, layers.ooaza]);

  const thisMapId = MapsId.Numazu;

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
      setareaBorderData(await getNumazuAreaData());
      setooazaBorderData(await getNumazuOoazaData());
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

  const PANES = ['ooaza', 'area', 'muniNames'];

  const MuniNameMarker = useCallback(
    ({
      center,
      muniBorder,
      currentZoom,
      layers,
    }: {
      center: LatLngTuple;
      muniBorder: Ooaza;
      currentZoom: number;
      layers: {
        area: boolean;
        ooaza: boolean;
        placename: boolean;
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
    { name: 'area', title: '地区境界', checked: layers.area },
    { name: 'ooaza', title: '大字境界', checked: layers.ooaza },
    { name: 'placename', title: '地名表示', checked: layers.placename },
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
        list={<MuniList borderData={ooazaBorderData} areaData={areaBorderData} records={records} onChangeStatus={changeRecordStatus} isViewMode={isViewMode} />}
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
              /* 大字 */
              layers.ooaza &&
                ooazaBorderData.map((border: Ooaza) => {
                  // 计算中心点
                  const center = getBounds(border.coordinates);

                  return (
                    <Polygon
                      pane="ooaza"
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
                            addr={border.area ? border.area + '地区' : ''}
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
              /* 地区 */
              layers.area &&
                areaBorderData.map((border: OoazaArea) => {
                  // 计算中心点
                  const center = getBounds(border.coordinates);
                  return (
                    <Polygon
                      key={border.id}
                      pane="area"
                      pathOptions={{
                        fillColor: showAreaLevelColor ? getAreaFillColor(ooazaBorderData, records, border.name) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showAreaLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
                        weight: 0.7,
                        color: showAreaLevelColor ? getAreaForeColor(ooazaBorderData, records, border.name) : 'black',
                      }}
                      positions={border.coordinates}
                      interactive={false}
                    >
                      {((showAreaLevelColor && layers.placename) || (currentZoom < 8 && layers.placename)) && (
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
          </>
        }
      />
    </div>
  );
};
