import { VehicleStatus } from "@/lib/enums";
import { User } from "@/lib/types";
import { getUser } from "@/models/user.model";
import {
  createVehicle,
  getAllVehicles,
  getQueueOverviewPerCompany,
  getVehicleByTagId,
  getVehiclesByStatus,
  getVehiclesCount,
  updateVehicle,
} from "@/models/vehicle.model";
import { Vehicle } from "@prisma/client";
import { Router, Request, Response } from "express";

const vehicleRoutes = Router();


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/vehicles/create:
 *   post:
 *     summary: Create or update a vehicle
 *     description: Creates a new vehicle or updates an existing vehicle based on the provided data.
 *     tags: [Vehicle]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: integer
 *               vehicleNumber:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               fleetId:
 *                 type: integer
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle created or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 vehicleNumber:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *       400:
 *         description: Error creating or updating vehicle.
 */
vehicleRoutes.post("/vehicles/create", async (req: Request, res: Response) => {
  try {
    const vehicleData = {
      providerId: req.body.providerId,
      vehicleNumber: req.body.vehicleNumber,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      fleetId: req.body.fleetId,
      mobile:req.body.mobile,
      serviceTypeId: 1,
      serviceModel: "Standard",
      status: "active"
    } as Vehicle;
    const vehicle = await createVehicle(vehicleData);
    res.status(200).json(vehicle);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Retrieve all vehicles
 *     description: Retrieves a list of all vehicles, optionally filtered by search query and user role.
 *     tags: [Vehicle]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   vehicleNumber:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *       400:
 *         description: Error retrieving vehicles.
 */
vehicleRoutes.get("/vehicles", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const user = await getUser(req.user?.userId) as unknown as User;
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    if (user) {
      const vehicles = await getAllVehicles(user, query);
      res.status(200).json(vehicles);
    } else {
      res.status(400).json({ message: "User do not exist" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 *  /api/vehicles/count:
 *   get:
 *     summary: Get count of vehicles by status
 *     description: Returns the total number of vehicles based on the specified status and user role.
 *     tags: [Vehicle]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status of the vehicles to filter by.
 *     responses:
 *       200:
 *         description: Vehicle count.
 *         content:
 *           application/json:
 *             schema:
 *               type: integer
 *       400:
 *         description: Error retrieving vehicle count.
 */
vehicleRoutes.get("/vehicles/count", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const user = req.user;
    if (user) {
      const count = await getVehiclesCount(status, user);
      res.status(200).json(count);
    } else {
      res.status(400).json({ message: "User do not exist" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 *  /api/vehicles/status/{status}:
 *   get:
 *     summary: Get vehicles by status
 *     description: Retrieves a list of vehicles that match the specified status.
 *     tags: [Vehicle]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: Status of the vehicles to retrieve.
 *     responses:
 *       200:
 *         description: List of vehicles with specified status.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   vehicleNumber:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *       400:
 *         description: Error retrieving vehicles.
 */
vehicleRoutes.get(
  "/vehicles/status/:status",
  async (req: Request, res: Response) => {
    try {
      const status = req.params.status as VehicleStatus;
      const vehicles = await getVehiclesByStatus(status);
      res.status(200).json(vehicles);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/vehicles/update:
 *   patch:
 *     summary: Update vehicle details
 *     description: Updates the status, type, or special duty of a vehicle.
 *     tags: [Vehicle]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: integer
 *               status:
 *                 type: string
 *               type:
 *                 type: string
 *               specialDuty:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vehicle updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error updating vehicle.
 */
vehicleRoutes.patch("/vehicles/update", async (req: Request, res: Response) => {
  try {
    const updatedVehicle = await updateVehicle(req.body);
    res.status(200).json(updatedVehicle);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/vehicles/tag/{tagId}:
 *   get:
 *     summary: Get vehicle by tag ID
 *     description: Retrieves a vehicle associated with a specified tag ID.
 *     tags: [Vehicle]
 *     parameters:
 *       - in: path
 *         name: tagId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the tag associated with the vehicle.
 *     responses:
 *       200:
 *         description: Vehicle with specified tag ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error retrieving vehicle.
 */
vehicleRoutes.get(
  "/vehicles/tag/:tagId",
  async (req: Request, res: Response) => {
    try {
      const tagId = req.params.tagId;
      const vehicle = await getVehicleByTagId(Number(tagId));
      res.status(200).json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/vehicles/queue-overview:
 *   get:
 *     summary: Get queue overview per company
 *     description: Provides a queue overview based on location ID, summarizing transit status per company.
 *     tags: [Vehicle]
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: ID of the location for queue overview.
 *     responses:
 *       200:
 *         description: Queue overview for each company.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   companyName:
 *                     type: string
 *                   inParkQueue:
 *                     type: integer
 *                   inRollCallQueue:
 *                     type: integer
 *                   inLoadingQueue:
 *                     type: integer
 *                   totalCompleteTransit:
 *                     type: integer
 *       400:
 *         description: Error retrieving queue overview.
 */
vehicleRoutes.get(
  "/vehicles/queue-overview",
  async (req: Request, res: Response) => {
    try {
      const { locationId } = req.body;
      const overview = await getQueueOverviewPerCompany(Number(locationId));
      res.status(200).json(overview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default vehicleRoutes;
