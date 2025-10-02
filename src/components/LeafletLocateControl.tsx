import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
// npm install leaflet.locatecontrol @types/leaflet.locatecontrol
import { LocateControl } from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import { ControlPosition, DivIcon, Icon, IconOptions } from 'leaflet';

// https://stackoverflow.com/questions/57517001/react-leaflet-with-leaflet-locatecontrol

interface P {
  position: ControlPosition;
}

export default function LeafletLocateControl(props: { position: ControlPosition }) {
  const map = useMap();

  useEffect(() => {
    // geo locate props
    const locateOptions = {
      position: props.position ?? ('topright' as ControlPosition),
      maxZoom: 19 as number,
      onActivate: () => {}, // callback before engine starts retrieving locations
    };

    const lc = new LocateControl(locateOptions);
    // console.log(lc);
    lc.addTo(map);

    return () => {
      lc.remove();
    };
  }, [map]);

  return null;
}
