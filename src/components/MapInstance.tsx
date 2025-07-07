import { JSX, useEffect, useState } from 'react';
import { AttributionControl, MapContainer, ScaleControl, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { c_lat, c_lng, c_zoom } from '../utils/cookies';
import { mapTiles } from '../utils/map';

export const MapInstance = ({
  defaultLatLng,
  defaultZoom,
  backgroundTile,
  panes,
  onZoom,
  onMove,
  tileList,
}: {
  defaultLatLng: [number, number];
  defaultZoom: number;
  backgroundTile: string;
  panes: string[];
  onZoom: (zoom: number) => void;
  onMove: (latlng: [number, number]) => void;
  tileList: JSX.Element;
}) => {
  const [currentZoom, setCurrentZoom] = useState(c_zoom() ? Number(c_zoom()) : defaultZoom);
  const [currentLatLng, setcurrentLatLng] = useState(defaultLatLng);
  const [currentMapStyle, setcurrentMapStyle] = useState(2);

  const ZoomListener = () => {
    const map = useMapEvents({
      zoomend: () => {
        onZoom(map.getZoom());
        c_zoom(map.getZoom().toString());
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
        c_lat(currentLatLng[0].toString());
        c_lng(currentLatLng[1].toString());
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
    <MapContainer
      center={[c_lat() ? Number(c_lat()) : defaultLatLng[0], c_lng() ? Number(c_lng()) : defaultLatLng[1]]}
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
        url={mapTiles.find(tile => tile.id === backgroundTile)?.url || mapTiles[0].url}
      />
      {tileList}
    </MapContainer>
  );
};
