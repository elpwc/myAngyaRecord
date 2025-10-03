import { AdministratorPolygonInfo } from '../../utils/mapInfo';

export enum TinhType {
  Tinh = 1,
  TP = 2,
}

export interface TinhVietnam extends AdministratorPolygonInfo {
  type: TinhType;
  hantu: string;
  ja: string;
  zhcn: string;
}
