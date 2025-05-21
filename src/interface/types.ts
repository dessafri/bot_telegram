// src/interfaces/types.ts
export interface IUserData {
  id: string;
  name: string;
  email: string;
}

export interface ISessionData {
  chatId: number;
  email: string;
  token: string;
  name: string;
  userData: IUserData;
  loggedInAt: Date;
  expiresAt: Date;
}

export interface IAuthAPIResponse {
  success: boolean;
  token?: string;
  user?: IUserData;
  error?: string;
}

export interface MonitoringResponse {
  success: boolean;
  data: Array<{
    ipmain: string;
    linkmain: number;
    ipbackup: string;
    linkbackup: number;
    ippower: string;
    power_backup: number;
    Input_Power_AC: number;
    Output_Power_DC: string;
    Power_Load_DC: number;
  }>;
}
