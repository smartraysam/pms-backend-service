import {
  Location,
  TagStatus,
  User as PUser,
  Fleet,
  Tag,
  Notification,
  VehicleType,
} from "@prisma/client";

export type LoginProps = {
  email: string;
  password: string;
};

export type ResetPasswordProps = {
  token: string;
  password: string;
};

export type UpdateLocationProps = {
  name?: string;
  logo?: string | File;
};

export type ChangePasswordProps = {
  currentPassword: string;
  newPassword: string;
};

export type GetTagsProps = {
  status?: TagStatus;
};

export type Role = "Operational Manager" | "Location Manager" | "Super Manager";

export type User = {
  id: string;
  email: string;
  roleId: number ;
  logo?: string;
  name: string;
  location?: Location;
};

export type LocationDetails = {
  name: string;
  deviceCount: number;
  fleetCount: number;
  vehicleCount: number;
};

export type FleetDetails = {
  name: string;
  vehicleCount: number;
  locationName: string;
};

export type DeviceDetails = {
  name: string;
  status: "active" | "inactive";
  lastActive: Date | string;
  locationName?: string;
};

export type QueueDetails = {
  vehicleNo: string;
  queue: string | number;
  walletBalance: number;
  paymentStatus: "paid" | "unpaid";
  paymentDate: Date | string;
};

export type VehicleDetails = {
  id: number;
  providerId: number;
  fleetId: number;
  firstName: string;
  lastName: string;
  mobile: string;
  walletBalance: number;
  vehicleNumber: string;
  serviceTypeId: number;
  serviceModel: string;
  status: string;
  tagId: string | null;
  created_at: string;
  updated_at: string;
  tag: Tag | null;
  fleet: Fleet;
  specialDuty: boolean;
  type: VehicleType;
};

export type NotificationDetails = Notification & { vehicles: VehicleDetails[] };

export type LocationWithManager = Location & { admin: PUser };
export type DeviceOverview = {
  total: number;
  active: number;
  inactive: number;
  idle: number;
  percentageChange: number;
};

export type AuditLog = {
  id: number;
  actionType: string;
  performedBy: string | number;
  actionOn: string;
  actionDetails: string;
  date: Date | string;
};

export type ActivityLog = {
  id: string;
  vehicleNo: string;
  queue: "loading" | "parking-bay";
  vehicleStatus: "in" | "out";
  paymentStatus: "paid" | "unpaid";
  amount: number;
  date: Date | string;
};

export type ParkingBayQueue = {
  vehicleNo: string | number;
  entryTime: Date | string;
  walletBalance: number;
  company: string;
  rowCallStatus: boolean;
};

export type RowCallQueue = {
  vehicleNo: string;
  entryTime: Date | string;
  callTime: Date | string;
  walletBalance: number;
  company: string;
};

export type LoadingBayQueue = {
  vehicleNo: string;
  entryTime: Date | string;
  exitStatus: boolean;
  debitStatus: boolean;
  walletBalance: number;
  company: string;
};

export type Strip<T = any> = Omit<T, "id" | "created_at" | "updated_at">;
export type DateRange =
  | "today"
  | "yesterday"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "custom";

export type GetVehiclesQuery = {
  search?: string | null;
};

export type QueueOverview = {
  companyName: string;
  inParkQueue: number;
  inRollCallQueue: number;
  inLoadingQueue: number;
  totalCompleteTransit: number;
};

export type ApiParams<T = { id: string }> = { params: T };
