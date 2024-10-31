import { deleteOldUnlinkedTags, getTags } from "@/models/tags.model";
import { linkVehicleTag, unlinkVehicleTag } from "@/models/vehicle.model";
import { Router, Request, Response } from "express";

const router = Router();

/**
 * @swagger
 * /link-tag:
 *   post:
 *     summary: Link a tag to a vehicle
 *     description: Links a tag to a specific vehicle.
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: integer
 *               tagId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tag linked successfully.
 *       400:
 *         description: Error linking tag.
 */
router.post("/link-tag", async (req: Request, res: Response) => {
  const { vehicleId, tagId } = req.body;

  try {
    await linkVehicleTag(vehicleId, tagId);
    res.status(200).json({ message: "Tag linked successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /unlink-tag:
 *   post:
 *     summary: Unlink a tag from a vehicle
 *     description: Unlinks a tag from a specific vehicle.
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: integer
 *               tagId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tag unlinked successfully.
 *       400:
 *         description: Error unlinking tag.
 */
router.post("/unlink-tag", async (req: Request, res: Response) => {
  const { vehicleId, tagId } = req.body;

  try {
    await unlinkVehicleTag(vehicleId, tagId);
    res.status(200).json({ message: "Tag unlinked successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /get-tag:
 *   get:
 *     summary: Retrieve tags
 *     description: Retrieves tags based on optional status filter.
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status of the tag
 *     responses:
 *       200:
 *         description: List of tags
 *       400:
 *         description: Error retrieving tags.
 */
router.get("/get-tag", async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    const tags = await getTags();
    res.status(200).json(tags);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /delete-tag:
 *   post:
 *     summary: Delete old unlinked tags
 *     description: Deletes all unlinked tags except the latest two.
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Old unlinked tags deleted successfully.
 *       400:
 *         description: Error deleting tags.
 */
router.post("/delete-tag", async (_req: Request, res: Response) => {
  try {
    await deleteOldUnlinkedTags();
    res.status(200).json({ message: "Old unlinked tags deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
