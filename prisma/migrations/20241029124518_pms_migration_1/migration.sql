-- CreateEnum
CREATE TYPE "TokenTypes" AS ENUM ('accountVerificationToken', 'passwordResetToken');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('Active', 'Inactive', 'Idle');

-- CreateEnum
CREATE TYPE "ControlState" AS ENUM ('Open', 'Close');

-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('Unassigned', 'Assigned');

-- CreateEnum
CREATE TYPE "DebitType" AS ENUM ('Standard', 'InstantRide', 'None');

-- CreateEnum
CREATE TYPE "QueueLocation" AS ENUM ('Parking', 'Loading', 'RowCall', 'Exit');

-- CreateEnum
CREATE TYPE "Action" AS ENUM ('CREATE', 'EDIT', 'DELETE', 'VIEW');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVED', 'UNAPPROVED');

-- CreateEnum
CREATE TYPE "PathStatus" AS ENUM ('EXIT', 'ENTRY');

-- CreateEnum
CREATE TYPE "IncomingNotificationEntity" AS ENUM ('NEW_TAG_SCANNED', 'VEHICLE_ENTRY', 'VEHICLE_DEPARTURE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('STANDARD', 'SUV', 'EXECUTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "managerId" INTEGER,
    "phone_number" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "type" "TokenTypes" NOT NULL,
    "email" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "action" "Action" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "AppEntity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT,
    "networkId" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'Active',
    "ctlstate" "ControlState" NOT NULL DEFAULT 'Close',
    "installPoint" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "tagId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TagStatus" NOT NULL DEFAULT 'Unassigned',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "fleetId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "baseLocationId" INTEGER,
    "vehicleNumber" TEXT NOT NULL,
    "serviceTypeId" INTEGER NOT NULL,
    "serviceModel" TEXT NOT NULL,
    "specialDuty" BOOLEAN NOT NULL DEFAULT false,
    "type" "VehicleType" NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL,
    "tagId" INTEGER,
    "isStaffVehicle" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fleet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "fleetId" INTEGER NOT NULL DEFAULT 0,
    "baseLocationId" INTEGER,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serviceTypeId" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL,
    "fixed" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "waitingFreeMins" INTEGER NOT NULL,
    "waitingMinCharge" INTEGER NOT NULL,
    "baseLocationId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkRule" (
    "id" SERIAL NOT NULL,
    "minWalletBalance" INTEGER,
    "minPickupCharge" INTEGER,
    "sessionStartTime" TEXT,
    "suvRowCallMaxNumber" INTEGER,
    "executiveRowCallMaxNum" INTEGER,
    "maxCompanyQueueCall" INTEGER,
    "minCompanyDriverCount" INTEGER,
    "loadingBayQueueTimeout" INTEGER,
    "recallExpireTime" TEXT,
    "registerCloseTime" TEXT,
    "locationId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "callTime" TIMESTAMP(3),
    "queueLocation" "QueueLocation" NOT NULL DEFAULT 'Parking',
    "exitStatus" BOOLEAN NOT NULL DEFAULT false,
    "debitStatus" BOOLEAN NOT NULL DEFAULT false,
    "rowCallStatus" BOOLEAN NOT NULL DEFAULT false,
    "payStatus" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actionType" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "actionOn" TEXT,
    "actionDetails" TEXT,
    "locationId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" INTEGER,
    "locationId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingNotification" (
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "entity" "IncomingNotificationEntity" NOT NULL,
    "userId" INTEGER,
    "locationId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncomingNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkActivity" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "debitStatus" BOOLEAN NOT NULL DEFAULT false,
    "status" "PathStatus" NOT NULL DEFAULT 'ENTRY',
    "debitedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debitType" "DebitType" NOT NULL DEFAULT 'None',
    "queueLocation" "QueueLocation" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NotificationToVehicle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Location_adminId_key" ON "Location"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Fleet_name_email_company_key" ON "Fleet"("name", "email", "company");

-- CreateIndex
CREATE UNIQUE INDEX "ParkRule_locationId_key" ON "ParkRule"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "_NotificationToVehicle_AB_unique" ON "_NotificationToVehicle"("A", "B");

-- CreateIndex
CREATE INDEX "_NotificationToVehicle_B_index" ON "_NotificationToVehicle"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fleet" ADD CONSTRAINT "Fleet_baseLocationId_fkey" FOREIGN KEY ("baseLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkRule" ADD CONSTRAINT "ParkRule_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingNotification" ADD CONSTRAINT "IncomingNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingNotification" ADD CONSTRAINT "IncomingNotification_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkActivity" ADD CONSTRAINT "ParkActivity_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToVehicle" ADD CONSTRAINT "_NotificationToVehicle_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToVehicle" ADD CONSTRAINT "_NotificationToVehicle_B_fkey" FOREIGN KEY ("B") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
