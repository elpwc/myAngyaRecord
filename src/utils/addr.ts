/** 都道府県 & 支庁 */
export interface Prefecture {
  id: string;
  name: string;
  coordinates: [number, number][][];
}

/** 市区町村 */
export interface Municipality {
  id: string;
  pref: string;
  shinkoukyoku: string;
  gun_seireishi: string;
  name: string;
  name_kana: string;
  /** 是否是政令市辖区 */
  is_special_city_ward: boolean;
  coordinates: [number, number][][];
}

/** railway */
export interface Railway {
  companyName: string;
  isJR: boolean;
  coordinates: [number, number][][];
}
