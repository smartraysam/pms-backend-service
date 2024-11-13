import { AuditLog } from ".";

export type RegisterLocation = {
  name: string;
  address: string;
  adminId: number;
  logo?: string;
};

export type RegisterFleet = {
  name: string;
  email: string;
  company: string;
  fleetId: number;
  mobile: string;
  walletBalance: number;
  status: number;
  baseLocationId: number;

};
export type NewAdminData = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  adminId?: string;
  role: any;
  managerId?: number;
};

export type NewStaff = {
  firstName: string;
  lastName: string;
  mobile: string;
  vehicleNumber: string;
  serviceModel: string;
  // baseLocationId: number;
  // status: "Active" | "Inactive";
};

export type UpsertParkRuleProps = {
  minWalletBalance?: number;
  minPickupCharge?: number;
  sessionStartTime?: string;
  maxCompanyQueueCall?: number;
  minCompanyDriverCount?: number;
  loadingBayQueueTimeout?: number;
  recallExpireTime?: string;
  registerCloseTime?: string;
  executiveRowCallMaxNum?: number;
  suvRowCallMaxNumber?: number;
};

export type RegisterDeviceProps = {
  name: string;
  installPoint: string;
  deviceId: string;
};

export type UpdateDeviceProps = RegisterDeviceProps & { status: string };

export type CreateAuditLog = Omit<AuditLog, "id" | "date">;

export type LinkVehicleTagProps = {
  vehicleId: number;
  tagId: number;
};

export type CreateNotificationProps = {
  vehicles: number[];
  message: string;
};
