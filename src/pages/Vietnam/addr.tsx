import { AdministratorPolygonInfo } from '../../utils/addr';

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
