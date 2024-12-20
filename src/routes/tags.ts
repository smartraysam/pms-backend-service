import { createTags, deleteOldUnlinkedTags, getTags } from "@/models/tags.model";
import { linkVehicleTag, unlinkVehicleTag } from "@/models/vehicle.model";
import { Router, Request, Response } from "express";

const tagRoutes = Router();
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
 * /api/tag:
 *   post:
 *     summary: Create or retrieve a tag by its ID
 *     description: If a tag with the specified `tagId` exists, it retrieves it. Otherwise, it creates a new tag with that `tagId`.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tagId:
 *                 type: string
 *                 description: The ID of the tag to create or retrieve.
 *                 example: "tagid123"
 *     responses:
 *       200:
 *         description: Successfully created or retrieved the tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the tag.
 *                 tagId:
 *                   type: string
 *                   description: The tag ID.
 *       400:
 *         description: Bad request if `tagId` is missing or invalid.
 *       500:
 *         description: Internal server error.
 */
tagRoutes.post('/tag', async (req: Request, res: Response) => {
  const { tagId } = req.body;

  if (!tagId) {
     res.status(400).json({ message: "tagId is required" });
  }

  try {
    const tag = await createTags(tagId);
    res.status(200).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating or retrieving the tag" });
  }
});

/**
 * @swagger
 *  /api/tag/link-tag:
 *   post:
 *     summary: Link a tag to a vehicle
 *     description: Links a tag to a specific vehicle.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
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
tagRoutes.post("/tag/link-tag", async (req: Request, res: Response) => {
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
 * /api/tag/unlink-tag:
 *   post:
 *     summary: Unlink a tag from a vehicle
 *     description: Unlinks a tag from a specific vehicle.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
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
tagRoutes.post("/tag/unlink-tag", async (req: Request, res: Response) => {
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
 * /api/tag/get-tag:
 *   get:
 *     summary: Retrieve tags
 *     description: Retrieves tags based on optional status filter.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
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
tagRoutes.get("/tag/get-tag", async (req: Request, res: Response) => {
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
 * /api/tag/delete-tag:
 *   post:
 *     summary: Delete old unlinked tags
 *     description: Deletes all unlinked tags except the latest two.
 *     tags: [Tags]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Old unlinked tags deleted successfully.
 *       400:
 *         description: Error deleting tags.
 */
tagRoutes.post("/tag/delete-tag", async (_req: Request, res: Response) => {
  try {
    await deleteOldUnlinkedTags();
    res.status(200).json({ message: "Old unlinked tags deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default tagRoutes;
