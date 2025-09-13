import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import '../../../node_modules/leaflet/dist/leaflet.css';
import { Marker, Polygon, Popup, useMap } from 'react-leaflet';
import { getBounds, MapsId } from '../../utils/map';
import MapPopup from '../../components/MapPopup';
import L, { divIcon, LatLngTuple } from 'leaflet';
import { getFillcolor, getForecolor, getRecordGroups, getRecords, postRecord } from '../../utils/serverUtils';
import { Record, RecordGroup } from '../../utils/types';
import { isLogin } from '../../utils/userUtils';
import { c_zoom } from '../../utils/cookies';
import { useIsMobile } from '../../utils/hooks';
import { AsideBar, LayerCheckboxInfo } from '../../components/AsideBar';
import { MapInstance } from '../../components/MapInstance';
import { Ooaza, OoazaArea } from './addr';
import { getNumazuAreaData, getNumazuOoazaData } from './geojsonUtils';
import { getAreaFillColor, getAreaForeColor } from './utils';
import MuniList from './MuniList';

interface P {
  openMobileAsideMenu: boolean;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  const DEFAULT_LAT_LNG: [number, number] = [35.07834157237541, 138.83469834814696];
  const DEFAULT_ZOOM = 12;

  // let currentId: string = params.id as string;
  const [currentBackgroundTileMap, setcurrentBackgroundTileMap] = useState('blank');
  const [layers, setLayers] = useState({
    area: true,
    ooaza: true,
    placename: true,
  });
  const [areaBorderData, setareaBorderData]: [OoazaArea[], any] = useState([]);
  const [ooazaBorderData, setooazaBorderData]: [Ooaza[], any] = useState([]);

  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : DEFAULT_ZOOM);

  const [recordGroup, setrecordGroup] = useState<RecordGroup>();
  const [records, setrecords] = useState<Record[]>([]);

  const [currentLatLng, setcurrentLatLng] = useState(DEFAULT_LAT_LNG);
  const [currentMapStyle, setcurrentMapStyle] = useState(2);

  const showAreaLevelColor = useMemo(() => layers.area && !layers.ooaza, [layers.area, layers.ooaza]);

  const thisMapId = MapsId.Numazu;

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
      setareaBorderData(await getNumazuAreaData());
      setooazaBorderData(await getNumazuOoazaData());
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
            html: `<span>${muniBorder.name}</span>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          })}
        />
      );
    },
    [currentZoom, currentLatLng, layers]
  );

  const LAYERS: LayerCheckboxInfo[] = [
    { name: 'area', title: '地区表示', checked: layers.area },
    { name: 'ooaza', title: '大字表示', checked: layers.ooaza },
    { name: 'placename', title: '地名表示', checked: layers.placename },
  ];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex' }}>
      <AsideBar
        currentRecordGroup={recordGroup}
        thisMapId={thisMapId}
        openMobileAsideMenu={props.openMobileAsideMenu}
        currentTileMap={currentBackgroundTileMap}
        layers={LAYERS}
        list={<MuniList borderData={ooazaBorderData} areaData={areaBorderData} records={records} currentMapStyle={currentMapStyle} />}
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
                        fillColor: getFillcolor(currentMapStyle, records, border.id),
                        color: getForecolor(currentMapStyle, records, border.id),
                        opacity: 1,
                        fillOpacity: currentBackgroundTileMap !== 'blank' ? 0.6 : 1,
                        weight: 0.4,
                      }}
                      positions={border.coordinates}
                    >
                      <Popup closeOnClick className="popupStyle">
                        <MapPopup
                          addr={border.area ? border.area + '地区' : ''}
                          name={border.name}
                          hasOpenningRecordGroup={!!recordGroup?.id}
                          onClick={value => {
                            if (recordGroup?.id) {
                              postRecord(
                                recordGroup?.id,
                                border.id,
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
                      <MuniNameMarker center={center as LatLngTuple} muniBorder={border} currentZoom={currentZoom} layers={layers} />
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
                        fillColor: showAreaLevelColor ? getAreaFillColor(currentMapStyle, ooazaBorderData, records, border.name) : '#ffffff',
                        opacity: 1,
                        fillOpacity: showAreaLevelColor ? (currentBackgroundTileMap !== 'blank' ? 0.6 : 1) : 0,
                        weight: 0.7,
                        color: showAreaLevelColor ? getAreaForeColor(currentMapStyle, ooazaBorderData, records, border.name) : 'black',
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
                            html: `<p class="placeNameLabel">${border.name}</p>`,
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
