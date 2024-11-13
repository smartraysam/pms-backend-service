import { Router, Request, Response } from "express";
import {
  createFleet,
  fetchFleets,
  getFleetCount,
  updateFleet,
  updateFleetPriority,
} from "@/models/fleet.model";
import { getUser } from "@/models/user.model";
import { User } from "@/lib/types";

const  fleetRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Fleets
 *   description: Fleet management
 */

/**
 * @swagger
 * /api/fleets:
 *   post:
 *     summary: Create or update a fleet
 *     tags: [Fleets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               company:
 *                 type: string
 *               fleetId:
 *                 type: number 
 *               mobile:
 *                 type: string
 *               walletBalance:
 *                 type: number
 *               status:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fleet created or updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
fleetRoutes.post("/fleets", async (req, res) => {
  try {
    const fleet = await createFleet(req.body);
    res.status(200).json(fleet);
  } catch (error) {
    res.status(500).json({ error: "Error creating/updating fleet" });
  }
});

/**
 * @swagger
 * /api/fleets:
 *   get:
 *     summary: Get a list of fleets based on user role
 *     tags: [Fleets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fleets
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
fleetRoutes.get("/fleets", async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user?.userId)  as unknown as User;
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    const fleets = await fetchFleets(user);
    res.status(200).json(fleets);
  } catch (error) {
    res.status(500).json({ error: "Error fetching fleets" });
  }
});

/**
 * @swagger
 * /api/fleets/count:
 *   get:
 *     summary: Get the count of fleets based on user role
 *     tags: [Fleets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet count
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
fleetRoutes.get("/fleets/count",  async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user?.userId) as unknown as User;
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const count = await getFleetCount(user);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: "Error fetching fleet count" });
  }
});

/**
 * @swagger
 * /api/fleets/{id}:
 *   put:
 *     summary: Update a fleet's data
 *     tags: [Fleets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Fleet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               company:
 *                 type: string
 *               mobile:
 *                 type: string
 *               walletBalance:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fleet updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Fleet not found
 *       500:
 *         description: Internal server error
 */
fleetRoutes.put("/fleets/:id", async (req, res) => {
  try {
    const fleet = await updateFleet({ id: parseInt(req.params.id) }, req.body);
    res.status(200).json(fleet);
  } catch (error) {
    res.status(500).json({ error: "Error updating fleet" });
  }
});

/**
 * @swagger
 * /api/fleets/{id}/priority:
 *   patch:
 *     summary: Update fleet priority
 *     tags: [Fleets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Fleet ID
 *       - in: query
 *         name: priority
 *         schema:
 *           type: boolean
 *         required: true
 *         description: Priority status
 *     responses:
 *       200:
 *         description: Fleet priority updated successfully
 *       404:
 *         description: Fleet not found
 *       500:
 *         description: Internal server error
 */
fleetRoutes.patch("/fleets/:id/priority", async (req, res) => {
  const { priority } = req.query;
  try {
    const fleet = await updateFleetPriority(
      parseInt(req.params.id),
      priority === "true"
    );
    res.status(200).json(fleet);
  } catch (error) {
    res.status(500).json({ error: "Error updating fleet priority" });
  }
});

export default fleetRoutes;
