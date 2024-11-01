import { DENIED, GRANTED } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { autoDeactivateDevices, updateDeviceById } from "@/models/device.model";
import { createParkActivity } from "@/models/park-activities.model";
import {
  allowSpecialVehicleAccess,
  createQueue,
  deleteQueue,
  getQueueById,
  processQueueAction,
  updateQueue,
} from "@/models/queue.model";
import { getVehicleByTagId } from "@/models/vehicle.model";
import { ControlState, TagStatus } from "@prisma/client";
import { Router, Request, Response } from "express";

const accessRoutes = Router();

/**
 * @swagger
 * /access-control:
 *   post:
 *     summary: Handles access control with device and tag validation, endpoint is to be call in access control device.
 *     description: Deletes a user account based on the provided ID.
 *     tags: [AccessControl]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *                 description: The ID of the device.
 *                 example: "EntPAbjAkinon78"
 *               tagId:
 *                 type: string
 *                 description: The ID of the tag.
 *                 example: "TAG12345"
 *     responses:
 *       200:
 *         description: Success or access denied response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message.
 *       500:
 *         description: Internal Server Error.
 */
accessRoutes.post("/access-control", async (req: Request, res: Response) => {
  const { deviceId, tagId } = req.body;
  autoDeactivateDevices();
  if (
    !deviceId ||
    !tagId ||
    tagId === "" ||
    tagId.length < 5 ||
    deviceId === ""
  ) {
    res.status(200).json(accessDeniedResponse(deviceId));
  }
  try {
    const device = await updateDeviceById(deviceId);
    if (device.ctlstate === ControlState.Open) return;

    let tag = await prisma.tag.findFirst({ where: { tagId } });
    if (!tag) {
      if (deviceId === "Device1") {
        tag = await prisma.tag.create({ data: { tagId } });
      }
      res.status(200).json(accessDeniedResponse(deviceId));
      return;
    }

    if (tag.status !== TagStatus.Assigned) {
      res.status(200).json(accessDeniedResponse(deviceId));
    }
    const vehicle = await getVehicleByTagId(tag.id);
    if (!vehicle || vehicle.status === "banned") {
      res.status(200).json(accessDeniedResponse(deviceId));
    }

    const resp = await handleAccessControl(deviceId, vehicle.id);
    await updateDeviceById(deviceId, ControlState.Close);
    res.status(200).json(resp);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const accessDeniedResponse = (deviceId: string) => ({
  error: false,
  message: "Access denied",
  data: {
    deviceId,
    control: DENIED,
  },
});

const accessGrantedResponse = async (deviceId: string) => {
  await updateDeviceById(deviceId, ControlState.Open);
  return {
    error: false,
    message: "Access granted",
    data: {
      deviceId,
      control: GRANTED,
    },
  };
};
const handleAccessControl = async (deviceId: string, vehicleId: number) => {
  switch (deviceId) {
    case "Device1": {
      // @ts-ignore
      const queue = await getQueueById(vehicleId);
      if (queue) {
        await updateQueue(vehicleId, {
          entryTime: new Date(),
          exitTime: null,
          callTime: null,
          queueLocation: "Parking",
          exitStatus: false,
          debitStatus: false,
          rowCallStatus: false,
          payStatus: false,
        });
      } else {
        await createQueue({
          vehicleId,
          entryTime: new Date(),
          exitTime: null,
          callTime: null,
          queueLocation: "Parking",
          exitStatus: false,
          debitStatus: false,
          rowCallStatus: false,
          payStatus: false,
        });
      }

      await createParkActivity({
        vehicleId,
        queueLocation: "Parking",
        debitStatus: false,
        status: "ENTRY",
        debitedAmount: 0,
        debitType: "None",
      });
      (async () => {
        try {
          await processQueueAction();
        } catch (error) {
          console.error("Error in async function:", error);
        }
      })();
      return accessGrantedResponse(deviceId);
    }
    case "Device2": {
      const queue = await getQueueById(vehicleId);
      if (queue) {
        const { allowSpecial, fleetPriority } = await allowSpecialVehicleAccess(
          vehicleId,
          "Parking"
        );
        if (allowSpecial || fleetPriority) {
          if (queue) {
            await updateQueue(vehicleId, {
              exitTime: new Date(),
              exitStatus: true,
              queueLocation: "RowCall",
              debitStatus: false,
              rowCallStatus: true,
              payStatus: false,
            });
          } else {
            await createQueue({
              vehicleId,
              exitTime: new Date(),
              exitStatus: true,
              queueLocation: "RowCall",
              debitStatus: false,
              rowCallStatus: true,
              payStatus: false,
            });
          }
        } else {
          if (queue.rowCallStatus && queue.queueLocation === "RowCall") {
            await updateQueue(vehicleId, {
              exitTime: new Date(),
              exitStatus: true,
            });
          } else {
            await deleteQueue(queue?.id);
          }
        }

        await createParkActivity({
          vehicleId,
          queueLocation: "Parking",
          debitStatus: false,
          status: "EXIT",
          debitedAmount: 0,
          debitType: "None",
        });
        return accessGrantedResponse(deviceId);
      }
      break;
    }
    case "Device3": {
      console.log("in loading bay");
      const queue = await getQueueById(vehicleId);
      const { isStaff, allowSpecial, fleetPriority, enoughWalletBalance } =
        await allowSpecialVehicleAccess(vehicleId, "Loading");
      if (isStaff) {
        await createParkActivity({
          vehicleId,
          queueLocation: "Loading",
          debitStatus: false,
          status: "ENTRY",
          debitedAmount: 0,
          debitType: "None",
        });
        return accessGrantedResponse(deviceId);
      } else if (allowSpecial || fleetPriority) {
        if (enoughWalletBalance) {
          if (queue) {
            await updateQueue(vehicleId, {
              entryTime: new Date(),
              exitTime: null,
              callTime: null,
              queueLocation: "Loading",
              exitStatus: true,
              debitStatus: false,
              rowCallStatus: true,
              payStatus: false,
            });
          } else {
            await createQueue({
              vehicleId,
              entryTime: new Date(),
              exitTime: null,
              callTime: null,
              queueLocation: "Loading",
              exitStatus: true,
              debitStatus: false,
              rowCallStatus: true,
              payStatus: false,
            });
          }

          await createParkActivity({
            vehicleId,
            queueLocation: "Loading",
            debitStatus: false,
            status: "ENTRY",
            debitedAmount: 0,
            debitType: "None",
          });
          return accessGrantedResponse(deviceId);
        }
        return accessDeniedResponse(deviceId);
      } else {
        console.log("loading bay", queue);
        if (queue && queue.exitStatus && queue.queueLocation === "RowCall") {
          await updateQueue(vehicleId, {
            queueLocation: "Loading",
            entryTime: new Date(),
            debitStatus: false,
          });
          await createParkActivity({
            vehicleId,
            queueLocation: "Loading",
            debitStatus: false,
            status: "ENTRY",
            debitedAmount: 0,
            debitType: "None",
          });
          return accessGrantedResponse(deviceId);
        }
      }
      break;
    }
    case "Device4": {
      const { isStaff } = await allowSpecialVehicleAccess(vehicleId, "Loading");
      if (isStaff) {
        await createParkActivity({
          vehicleId,
          queueLocation: "Loading",
          debitStatus: true,
          status: "EXIT",
          debitedAmount: 0,
          debitType: "None",
        });
        return accessGrantedResponse(deviceId);
      } else {
        const queue = await getQueueById(vehicleId);
        if (queue && queue.debitStatus) {
          await createParkActivity({
            vehicleId,
            queueLocation: "Exit",
            debitStatus: true,
            status: "EXIT",
            debitedAmount: 0,
            debitType: "None",
          });
          await deleteQueue(queue.id);
          (async () => {
            try {
              await processQueueAction();
            } catch (error) {
              console.error("Error in async function:", error);
            }
          })();
          return accessGrantedResponse(deviceId);
        }
      }
      break;
    }
    default:
      return accessDeniedResponse(deviceId);
  }
};
export default accessRoutes;
