import { AdministratorPolygonInfo, Railway } from '../../utils/mapInfo';

export interface HongkongDistrict extends AdministratorPolygonInfo {
  en: string;
}

/** railway */
export interface HongkongRailway extends Railway {
  lineNameEn: string;}
