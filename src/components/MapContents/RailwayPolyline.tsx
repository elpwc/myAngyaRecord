import React from 'react';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-textpath';
import { useMap } from 'react-leaflet';

interface P {
  latlngs: [number, number][][];
  type: number;
}

export const RailwayPolyline = ({ latlngs, type }: P) => {
  const map = useMap();

  useEffect(() => {
    const polyline = L.polyline(latlngs, {
      color: '#4f4f4f',
      weight: 1,
    }).addTo(map);

    let lineText = '+';

    switch (type) {
      case 0:
        lineText = '+';
        break;
      case 1:
        lineText = '=';
        break;
      default:
        lineText = '+';
        break;
    }

    // 沿线条加文字
    //@ts-ignore
    polyline.setText(lineText, {
      repeat: true,
      center: true,
      offset: 5,
      attributes: { fill: '#4f4f4f', 'font-size': '14px' },
    });

    return () => {
      map.removeLayer(polyline);
    };
  }, [map]);

  return <></>;
};
