/** 自治体Polygon情報 */
export interface AdministratorPolygonInfo {
  id: string;
  name: string;
  coordinates: [number, number][][];
  labelPos: [number, number];
}

/** railway */
export interface Railway {
  lineName: string;
  coordinates: [number, number][][];
  type: RailwayType;
}

export enum RailwayType {
  railway = 0,
  highSpeedRailway = 1,
  metro = 2,
  tram = 3,
  lightrail = 4,
  monorail = 5,
}

export enum PrivateRailwayLineStyle {
  RedLine = 0,
  PlusLine = 1,
}
