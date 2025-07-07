import { AdministratorPolygonInfo } from '../../utils/addr';

/** 都道府県 & 支庁 */
export interface Prefecture extends AdministratorPolygonInfo {}

/** 市区町村 */
export interface Municipality extends AdministratorPolygonInfo {
  pref: string;
  shinkoukyoku: string;
  gun_seireishi: string;
  name_kana: string;
  /** 是否是政令市辖区 */
  is_special_city_ward: boolean;
}
