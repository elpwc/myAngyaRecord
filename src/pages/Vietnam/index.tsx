import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { Marker, Polygon, Polyline, Popup, useMap } from 'react-leaflet';
import { getBounds, MapsId } from '../../utils/map';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import { getCurrentFillColorByRecords, getCurrentForeColorByRecords, getRecordGroups, getRecords, postRecord } from '../../utils/serverUtils';
import { Record, RecordGroup } from '../../utils/types';
import { isLogin } from '../../utils/userUtils';
import { c_zoom } from '../../utils/cookies';
import { useIsMobile } from '../../utils/hooks';
import { AsideBar, LayerCheckboxInfo } from '../../components/AsideBar';
import { MapInstance } from '../../components/MapInstance';
import { TinhVietnam } from './addr';
import { getRailwaysData, getTinhVietnamData } from './geojsonUtils';
import MuniList from './MuniList';
import { Railway, RailwayType } from '../../utils/addr';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const DEFAULT_LAT_LNG: [number, number] = [16.059890812484632, 107.2631833702326];
  const DEFAULT_ZOOM = 6;
  const thisMapId = MapsId.Vietnam;

  // let currentId: string = params.id as string;
  const [currentBackgroundTileMap, setcurrentBackgroundTileMap] = useState('blank');
  const [layers, setLayers] = useState({
    tinh: true,
    railways: true,
    placename: true,
  });
  const [tinhBorderData, settinhBorderData]: [TinhVietnam[], any] = useState([]);
  const [railwaysData, setrailwaysData]: [Railway[], any] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : DEFAULT_ZOOM);

  const [recordGroup, setrecordGroup] = useState<RecordGroup>();
  const [records, setrecords] = useState<Record[]>([]);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);
  const [currentMapStyle, setcurrentMapStyle] = useState(2);

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
      settinhBorderData(await getTinhVietnamData());
      setrailwaysData(await getRailwaysData());
    })();
    refreshRecordGroups();
    refreshRecords();
  }, []);

  useEffect(() => {
    refreshRecords();
  }, [recordGroup?.id]);

  const handleMapBackgroundTileChange = (id: string) => {
    setcurrentBackgroundTileMap(id);
  };

  const handleLayerChange = (name: string, checked: boolean) => {
    setLayers(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const PANES = ['tinh', 'railways', 'muniNames'];

  const MuniNameMarker = useCallback(
    ({
      center,
      muniBorder,
      currentZoom,
      layers,
    }: {
      center: LatLngTuple;
      muniBorder: TinhVietnam;
      currentZoom: number;
      layers: {
        tinh: boolean;
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
            html: `<span>${muniBorder.name}</span>`,
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
    { name: 'tinh', title: '省界', checked: layers.tinh },
    { name: 'placename', title: '地名表示', checked: layers.placename },
    { name: 'railways', title: '鉄道路線', checked: layers.railways },
  ];

  /**
   * 对DB中的自治体行脚记录进行修改
   * @param muniId
   * @param status
   */
  const changeRecordStatus = (muniId: string, status: number) => {
    if (recordGroup?.id) {
      postRecord(
        recordGroup?.id,
        muniId,
        status,
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
        currentRecordGroup={recordGroup}
        thisMapId={thisMapId}
        openMobileAsideMenu={props.openMobileAsideMenu}
        currentTileMap={currentBackgroundTileMap}
        layers={LAYERS}
        list={<MuniList borderData={tinhBorderData} records={records} onChangeStatus={changeRecordStatus} />}
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
        doSaveLatLngToCookies={false}
        doSaveZoomToCookies={false}
        tileList={
          <>
            {
              /* 省 */
              layers.tinh &&
                tinhBorderData.map((border: TinhVietnam) => {
                  // 计算中心点
                  const center = getBounds(border.coordinates);

                  return (
                    <Polygon
                      pane="tinh"
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
                    >
                      <Popup closeOnClick className="popupStyle">
                        <MapPopup
                          addr={''}
                          name={border.name}
                          hasOpenningRecordGroup={!!recordGroup?.id}
                          onClick={value => {
                            changeRecordStatus(border.id, value);
                          }}
                        />
                      </Popup>
                      <MuniNameMarker center={center as LatLngTuple} muniBorder={border} currentZoom={currentZoom} layers={layers} />
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
                      pathOptions={{ weight: 1, color: 'darkred', opacity: 1, fillOpacity: 1 }}
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
