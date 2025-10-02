import { JSX, useEffect, useState } from 'react';
import { AttributionControl, MapContainer, ScaleControl, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { c_lat, c_lng, c_zoom } from '../utils/cookies';
import { mapTiles } from '../utils/map';
import { MapStyleControl } from './MapControls/MapStyleControl';
import LeafletLocateControl from './MapControls/LeafletLocateControl';
import { EditModeSwitchControl } from './MapControls/EditModeSwitchControl';
import { RecordGroupInfoControl } from './MapControls/RecordGroupInfoControl';
import { isLogin } from '../utils/userUtils';

export const MapInstance = ({
  defaultLatLng,
  defaultZoom,
  backgroundTile,
  panes,
  onZoom,
  onMove,
  tileList,
  doSaveZoomToCookies = true,
  doSaveLatLngToCookies = true,
}: {
  defaultLatLng: [number, number];
  defaultZoom: number;
  backgroundTile: string;
  panes: string[];
  onZoom: (zoom: number) => void;
  onMove: (latlng: [number, number]) => void;
  tileList: JSX.Element;
  doSaveZoomToCookies?: boolean;
  doSaveLatLngToCookies?: boolean;
}) => {
  const [currentZoom, setCurrentZoom] = useState(doSaveZoomToCookies ? (c_zoom() ? Number(c_zoom()) : defaultZoom) : defaultZoom);
  const [currentLatLng, setcurrentLatLng] = useState(doSaveLatLngToCookies ? [c_lat() ? Number(c_lat()) : defaultLatLng[0], c_lng() ? Number(c_lng()) : defaultLatLng[1]] : defaultLatLng);

  const ZoomListener = () => {
    const map = useMapEvents({
      zoomend: () => {
        onZoom(map.getZoom());
        if (doSaveZoomToCookies) {
          c_zoom(map.getZoom().toString());
        }
        setCurrentZoom(map.getZoom());
        //console.log(map.getZoom());
      },
    });
    return null;
  };

  const MapCenterTracker = () => {
    useMapEvents({
      moveend: e => {
        const map = e.target;
        onMove([map.getCenter().lat, map.getCenter().lng]);
        setcurrentLatLng([map.getCenter().lat, map.getCenter().lng]);
        if (doSaveLatLngToCookies) {
          c_lat(currentLatLng[0].toString());
          c_lng(currentLatLng[1].toString());
        }
        //console.log([map.getCenter().lat, map.getCenter().lng]);
      },
    });
    return null;
  };

  const PaneSetter = () => {
    const map = useMap();

    useEffect(() => {
      if (map.getPane(panes[0]) === undefined) {
        map.createPane('base');
        panes.forEach(pane => {
          map.createPane(pane);
        });
        const paneZIndexStart = 90;
        map.getPane('base')!.style.zIndex = paneZIndexStart.toString();
        panes.forEach((pane, i) => {
          map.getPane(pane)!.style.zIndex = (paneZIndexStart + i + 1).toString();
        });
      }
    }, []);

    return null;
  };

  return (
    <MapContainer center={[currentLatLng[0], currentLatLng[1]]} zoom={currentZoom} scrollWheelZoom={true} attributionControl={false} className="mapContainer">
      <ZoomListener />
      <MapCenterTracker />
      <PaneSetter />
      <ScaleControl position="bottomleft" />
      <AttributionControl position="bottomright" prefix={'Dev by <a href="https://github.com/elpwc" target="_blank">@elpwc</a>'} />
      <LeafletLocateControl position="bottomright" />
      <EditModeSwitchControl position="topright" />
      {isLogin() && <RecordGroupInfoControl position="topleft" />}
      <TileLayer
        pane="base"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={mapTiles.find(tile => tile.id === backgroundTile)?.url || mapTiles[0].url}
      />
      <MapStyleControl position="bottomright" />
      {tileList}
    </MapContainer>
  );
};
