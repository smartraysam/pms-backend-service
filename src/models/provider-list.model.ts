import { Fleet, ServiceType, Vehicle } from "@prisma/client";
import { ProviderListDetails } from "@/lib/types/provider-list";
import { createFleet, updateFleet } from "./fleet.model";
import { createServiceType } from "./service-type.model";
import { createVehicle } from "./vehicle.model";
import prisma from "@/lib/prisma";

export const runProviderOperation = async (
  param: ProviderListDetails[],
  location_id: string,
) => {
  let [numOfMissingServiceType, numOfSuccess] = [0, 0];
  const locationId = parseInt(location_id);

  for (const data of param) {
    if (!data.fleets || !data.service) {
      continue;
    }
    // save to fleet table
    const fleetData: Partial<Fleet> = {
      name: data.fleets.name,
      email: data.fleets.email,
      company: data.fleets.company,
      mobile: data.fleets.mobile,
      baseLocationId: locationId,
      fleetId: data.fleets.id,
      walletBalance: data.fleets.wallet_balance,
      status: data.fleets.status,
    };

    await createFleet(fleetData as Fleet);

    if (!data.service || !data.service.service_type) {
      numOfMissingServiceType++;
      continue;
    }

    // save to service type table
    const serviceTypeData: Partial<ServiceType> = {
      name: data.service.service_type.name,
      capacity: data.service.service_type.capacity,
      fixed: data.service.service_type.fixed,
      serviceTypeId: data.service.service_type_id,
      price: data.service.service_type.price,
      baseLocationId: locationId,
      minute: data.service.service_type.minute,
      hour: data.service.service_type.hour,
      waitingFreeMins: data.service.service_type.waiting_free_mins,
      waitingMinCharge: data.service.service_type.waiting_min_charge,
    };

    await createServiceType(serviceTypeData as ServiceType);
    const vehicleData: Partial<Vehicle> = {
      providerId: data.service.provider_id,
      fleetId: data.fleets.id ?? 0,
      firstName: data.first_name,
      lastName: data.last_name,
      mobile: data.mobile,
      baseLocationId: locationId,
      walletBalance: data.wallet,
      vehicleNumber: data.service.service_number,
      serviceTypeId: data.service.service_type_id ?? 0,
      serviceModel: data.service.service_model,
      status: data.status,
    };
    await createVehicle(vehicleData as Vehicle);
    numOfSuccess++;
  }

  return { numOfMissingServiceType, numOfSuccess };
};
