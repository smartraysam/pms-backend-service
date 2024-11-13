import {
  createNewLocation,
  deleteLocation,
  getLocationCount,
  getLocations,
  getUserLocation,
  updateUserLocation,
} from "@/models/location.model";
import { Request, Response, Router } from "express";

const locationRoutes = Router();

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
 * /api/locations:
 *   post:
 *     summary: Create new location
 *     tags: [Locations]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *            type: object
 *           properties:
 *            address:
 *             type: string
 *            name:
 *             type: string
 *            adminId:
 *             type: integer
 *            logo:
 *              type: string
 *     responses:
 *       200:
 *         description: Location updated successfully.
 *       404:
 *         description: Location not found.
 *       500:
 *         description: Internal server error.
 */
locationRoutes.post("/locations", async (req: Request, res: Response) => {
  try {
    await createNewLocation(req.body);
    res.status(201).json({ message: "Location created successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/locations/user:
 *   patch:
 *     summary: Update a user’s location details
 *     tags: [Locations]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *            type: object
 *           properties:
 *            address:
 *             type: string
 *            name:
 *             type: string
 *            adminId:
 *             type: integer
 *            logo:
 *              type: string
 *     responses:
 *       200:
 *         description: Location updated successfully.
 *       404:
 *         description: Location not found.
 *       500:
 *         description: Internal server error.
 */
locationRoutes.patch("/locations/user", async (req: Request, res: Response) => {
  const userId = req.user.userId;
  try {
    await updateUserLocation(userId, req.body);
    res.status(200).json({ message: "Location updated successfully" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/locations/delete/{id}:
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Location deleted successfully.
 *       404:
 *         description: Location not found.
 *       500:
 *         description: Internal server error.
 */
locationRoutes.delete("/locations/delete/:id", async (req: Request, res: Response) => {
  const locationId = parseInt(req.params.id);
  try {
    await deleteLocation(locationId);
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/locations/count:
 *   get:
 *     summary: Get the total count of locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The total count of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error.
 */
locationRoutes.get("/locations/count", async (req: Request, res: Response) => {
  try {
    const count = await getLocationCount();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Retrieve all locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   address:
 *                     type: string
 *                   name:
 *                     type: string
 *                   adminId:
 *                     type: object
 *                   email:
 *                     type: string
 *       500:
 *         description: Internal server error.
 */
locationRoutes.get("/locations", async (req: Request, res: Response) => {
  try {
    const locations = await getLocations();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/locations/user:
 *   get:
 *     summary: Get the location associated with a specific user
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's location.
 *       404:
 *         description: Location not found.
 *       500:
 *         description: Internal server error.
 */
locationRoutes.get("/locations/user", async (req: Request, res: Response) => {
  const userId = req.user.userId;
  try {
    const location = await getUserLocation(userId);
    res.status(200).json(location);
  } catch (error) {
    res.status(404).json({ message: "Location not found" });
  }
});


export default locationRoutes;
