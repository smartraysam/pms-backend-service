import {
  deleteDevice,
  getDevices,
  getDevicesById,
  getDevicesCount,
  registerDevice,
  updateDevice,
  updateDeviceById,
} from "@/models/device.model";

import { Request, Response, Router } from "express";

const deviceRoutes = Router();

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Register a new device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              name:
 *                type: string
 *                description: The name of the device.
 *                example: "Device 1"
 *              installPoint:
 *                type: string
 *                description: The installation point of the device.
 *                example: "EntryPoint"
 *              deviceId:
 *                type: string
 *                description: Unique identifier for the device.
 *                example: "EntPAbjAkinon78"
 *              locationId:
 *                type: number
 *                description: The location ID of the device.
 *                example: 1
 *     responses:
 *       201:
 *         description: Device created successfully
 */
deviceRoutes.post("/devices", async (req: Request, res: Response) => {
  try {
    const {deviceId, installPoint, name, locationId } = req.body;
   
    const data = {
      deviceId,
      installPoint,
      name,
    };
    const device = await registerDevice(data, locationId);
    res.status(201).json(device);
  } catch (error :any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     summary: Update an existing device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               installPoint:
 *                 type: string
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device updated successfully
 */
deviceRoutes.put("/devices/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await updateDevice(parseInt(id), req.body);
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/{deviceId}:
 *   get:
 *     summary: Get device by ID
 *     tags: [Devices]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device found
 */
deviceRoutes.get("/devices/:deviceId", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const device = await getDevicesById(deviceId);
    res.json(device);
  } catch (error :any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/update/{deviceId}:
 *   patch:
 *     summary: Update device by deviceId
 *     tags: [Devices]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               control:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device updated successfully
 */
deviceRoutes.patch(
  "/devices/update/:deviceId",
  async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      const { control } = req.body;
      const device = await updateDeviceById(deviceId, control);
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete a device by ID
 *     tags: [Devices]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Device deleted successfully
 */
deviceRoutes.delete("/devices/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteDevice(parseInt(id));
    res.status(204).send();
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/count:
 *   get:
 *     summary: Get count of devices
 *     tags: [Devices]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of devices
 */
deviceRoutes.get("/devices/count", async (req: Request, res: Response) => {
  try {
    const count = await getDevicesCount();
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices for a user
 *     tags: [Devices]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of devices
 */
deviceRoutes.get("/devices", async (req: Request, res: Response) => {
  try {
    const userId  =  req.user.userId;
    const devices = await getDevices(userId);
    res.json(devices);
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

export default deviceRoutes;
