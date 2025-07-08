import { MapsId } from './map';

export type UserInfo = { name: string | undefined; token: string | undefined };

export interface User {
  id: number;
  name: string;
  pw: string;
  is_deleted: boolean;
  is_banned: boolean;
  auth: number;
  create_date: string;
  update_date: string;
  last_login: string | null;
  email: string;
  verified: boolean;
}

export interface RecordGroup {
  id: number;
  uid: number;
  name: string;
  desc: string;
  mapid: MapsId;
  score: number;
  is_deleted: boolean;
  create_date: string;
  update_date: string;
  is_public: boolean;
  show_lived_level: boolean;
}

export interface Record {
  id: number;
  uid: number;
  group_name: string;
  group_id: number;
  admin_id: string;
  level: number;
  is_deleted: boolean;
  create_date: string;
  update_date: string;
}

export interface Ranking extends RecordGroup {
  username: string;
  ranking: number;
}

export interface RankingResponse {
  ranking: Ranking[];
  total: number;
}
