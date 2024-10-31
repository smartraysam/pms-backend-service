import { createQueue, deleteQueue, getAllQueues, getQueueById, updateQueue } from "@/models/queue.model";
import { Router, Request, Response } from "express";

const queueRoutes = Router();

/**
 * @swagger
 * /queues:
 *   get:
 *     summary: Get all queues
 *     description: Returns a list of all queue entries.
 *     tags: [Queue]
 *     responses:
 *       200:
 *         description: List of all queues.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Error fetching queues.
 */
queueRoutes.get("/queues", async (req: Request, res: Response) => {
  try {
    const queues = await getAllQueues();
    res.status(200).json(queues);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /queues/{vehicleId}:
 *   get:
 *     summary: Get a queue by vehicle ID
 *     description: Fetches a queue entry for a specified vehicle ID.
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vehicle ID to fetch the queue entry for.
 *     responses:
 *       200:
 *         description: Queue entry for the specified vehicle ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error fetching queue.
 */
queueRoutes.get("/queues/:vehicleId", async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const queue = await getQueueById(vehicleId);
    res.status(200).json(queue);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /queues:
 *   post:
 *     summary: Create a new queue entry
 *     description: Adds a new queue entry with specified data.
 *     tags: [Queue]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: integer
 *               entryTime:
 *                 type: string
 *                 format: date-time
 *               exitTime:
 *                 type: string
 *                 format: date-time
 *               callTime:
 *                 type: string
 *                 format: date-time
 *               queueLocation:
 *                 type: string
 *                 enum: [Parking, Loading, RowCall, Exit]
 *               exitStatus:
 *                 type: boolean
 *               debitStatus:
 *                 type: boolean
 *               rowCallStatus:
 *                 type: boolean
 *               payStatus:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Queue entry created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error creating queue entry.
 */
queueRoutes.post("/queues", async (req: Request, res: Response) => {
  try {
    const queue = await createQueue(req.body);
    res.status(201).json(queue);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /queues/{vehicleId}:
 *   patch:
 *     summary: Update a queue entry
 *     description: Updates a queue entry based on vehicle ID with specified data.
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vehicle ID to update the queue entry for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exitTime:
 *                 type: string
 *                 format: date-time
 *               entryTime:
 *                 type: string
 *                 format: date-time
 *               callTime:
 *                 type: string
 *                 format: date-time
 *               queueLocation:
 *                 type: string
 *                 enum: [Parking, Loading, RowCall, Exit]
 *               exitStatus:
 *                 type: boolean
 *               debitStatus:
 *                 type: boolean
 *               rowCallStatus:
 *                 type: boolean
 *               payStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Queue entry updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error updating queue entry.
 */
queueRoutes.patch("/queues/:vehicleId", async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const updatedQueue = await updateQueue(vehicleId, req.body);
    res.status(200).json(updatedQueue);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /queues/{vehicleId}:
 *   delete:
 *     summary: Delete a queue entry by vehicle ID
 *     description: Deletes a queue entry for the specified vehicle ID.
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vehicle ID to delete the queue entry for.
 *     responses:
 *       200:
 *         description: Queue entry deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error deleting queue entry.
 */
queueRoutes.delete("/queues/:vehicleId", async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const deletedQueue = await deleteQueue(vehicleId);
    res.status(200).json(deletedQueue);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});


export default queueRoutes;