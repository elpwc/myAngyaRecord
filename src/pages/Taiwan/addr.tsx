import { AdministratorPolygonInfo } from '../../utils/mapInfo';

export interface TaiwanTown extends AdministratorPolygonInfo {
  countyCode: string;
}

export interface TaiwanCounty extends AdministratorPolygonInfo {}
