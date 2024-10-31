import { createParkActivity, getAllParkActivities, getParkActivitiesCount, getParkActivityById, getParkedVehiclesByMonth, getTotalRidePerYear, getVehiclesInParkCount } from "@/models/park-activities.model";
import { Router, Request, Response } from "express";


const parkActivityRoutes = Router();

/**
 * @swagger
 * /park-activities:
 *   post:
 *     summary: Create a new park activity
 *     description: Creates a new park activity entry for a vehicle.
 *     tags: [ParkActivities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: integer
 *               queueLocation:
 *                 type: string
 *                 example: Parking
 *               debitStatus:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 example: ENTRY
 *     responses:
 *       200:
 *         description: Successfully created park activity.
 *       400:
 *         description: Error creating park activity.
 */
parkActivityRoutes.post("/park-activities", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const parkActivity = await createParkActivity(data);
    res.status(200).json(parkActivity);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /park-activities:
 *   get:
 *     summary: Get all park activities
 *     description: Returns a list of all park activities.
 *     tags: [ParkActivities]
 *     responses:
 *       200:
 *         description: List of all park activities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Error fetching park activities.
 */
parkActivityRoutes.get("/park-activities", async (req: Request, res: Response) => {
  try {
    const parkActivities = await getAllParkActivities();
    res.status(200).json(parkActivities);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /park-activities/{id}:
 *   get:
 *     summary: Get a park activity by ID
 *     description: Returns a single park activity by its ID.
 *     tags: [ParkActivities]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the park activity.
 *     responses:
 *       200:
 *         description: Park activity found.
 *       404:
 *         description: Park activity not found.
 */
parkActivityRoutes.get("/park-activities/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parkActivity = await getParkActivityById(id);
    res.status(200).json(parkActivity);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

/**
 * @swagger
 * /park-activities/count:
 *   get:
 *     summary: Get total count of park activities
 *     description: Returns the total count of park activities.
 *     tags: [ParkActivities]
 *     responses:
 *       200:
 *         description: Count of park activities.
 */
parkActivityRoutes.get("/park-activities/count", async (req: Request, res: Response) => {
  try {
    const count = await getParkActivitiesCount();
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /park-activities/parked-vehicles/{year}:
 *   get:
 *     summary: Get parked vehicles by month
 *     description: Returns the count of parked vehicles per month for a specified year.
 *     tags: [ParkActivities]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Year to filter parked vehicles by.
 *     responses:
 *       200:
 *         description: List of parked vehicles per month.
 */
parkActivityRoutes.get("/park-activities/parked-vehicles/:year", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const parkedVehicles = await getParkedVehiclesByMonth(year);
    res.status(200).json(parkedVehicles);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /park-activities/total-rides/{year}:
 *   get:
 *     summary: Get total rides for the year
 *     description: Returns the total number of complete rides for a specified year.
 *     tags: [ParkActivities]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Year to get the ride count for.
 *     responses:
 *       200:
 *         description: Total rides for the year.
 */
parkActivityRoutes.get("/park-activities/total-rides/:year", async (req: Request, res: Response) => {
  try {
    const year = req.params.year;
    const totalRides = await getTotalRidePerYear(year);
    res.status(200).json({ totalRides });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /park-activities/vehicles-in-park:
 *   get:
 *     summary: Get count of vehicles currently in park
 *     description: Returns the count of vehicles that are currently in the park.
 *     tags: [ParkActivities]
 *     responses:
 *       200:
 *         description: Count of vehicles in park.
 */
parkActivityRoutes.get("/park-activities/vehicles-in-park", async (req: Request, res: Response) => {
  try {
    const count = await getVehiclesInParkCount();
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default  parkActivityRoutes;
