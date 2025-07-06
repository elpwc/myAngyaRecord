/** 都道府県 & 支庁 */
export interface Prefecture {
  id: string;
  name: string;
  coordinates: [number, number][][];
  labelPos: [number, number];
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
  railwayClassCd: RailwayClassCd;
  institutionTypeCd: InstitutionTypeCd;
  lineName: string;
  companyName: string;
  coordinates: [number, number][][];
}

/**
 * Railway classification code definitions.
 * コード: 鉄道の種類を示す番号
 */
export enum RailwayClassCd {
  /** 普通鉄道JR */
  NormalRailwayJR = 11,

  /** 普通鉄道 */
  NormalRailway = 12,

  /** 鋼索鉄道: 車両にロープを緊結して山上の巻上機により巻上げて運転するものであって，一般にケーブルカーと称されるものである。 */
  CableCar = 13,

  /** 懸垂式鉄道: 都市交通として利用されるモノレールの構造上の分類であって，車両の車体部分が軌道桁より垂れ下がっているものである。 */
  SuspendedMonorailRailway = 14,

  /** 跨座式鉄道: モノレールの分類で，車両の車体部分が軌道桁より上方にあってこれをまたぐ形のものである。 */
  StraddleMonorailRailway = 15,

  /** 案内軌条式鉄道: 軌道に車両の鉛直荷重を受ける走行路と車両の走行向を誘導する案内軌条を有し，操向装置として案内輪を有するものである。 */
  GuidedRailway = 16,

  /** 無軌条鉄道: レールを設けないで，普通の道路を架空電線に接して走る電車で一般にはトロリーバスと称される。 */
  Trolleybus = 17,

  /** 軌道: 道路に敷設されたレールを進行させるもの。道路交通の補助機関として一般に供されるもので，軌道法の適用を受けるものである。 */
  Tramway = 21,

  /** 懸垂式モノレール: 都市交通として利用されるモノレールの構造上の分類であって，車両の車体部分が軌道桁より垂れ下がっているものである。 */
  SuspendedMonorail = 22,

  /** 跨座式モノレール: モノレールの分類で，車両の車体部分が軌道桁より上方にあってこれをまたぐ形のものである。 */
  StraddleMonorail = 23,

  /** 案内軌条式: 軌道に車両の鉛直荷重を受ける走行路と車両の走行向を誘導する案内軌条を有し，操向装置として案内輪を有するものである。 */
  GuidedTrack = 24,

  /** 浮上式 */
  Maglev = 25,
}

/**
 * Institution type code definitions.
 * コード: 鉄道事業者の種類を示す番号
 */
export enum InstitutionTypeCd {
  /** JRの新幹線 */
  JRShinkansen = 1,

  /** JR在来線 */
  JRConventional = 2,

  /** 公営鉄道 */
  PublicRailway = 3,

  /** 民営鉄道 */
  PrivateRailway = 4,

  /** 第三セクター */
  ThirdSectorRailway = 5,
}
