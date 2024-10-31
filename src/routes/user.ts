import { deleteAccount, updateUserData } from "@/models/user.model";
import { Router, Request, Response } from "express";
const userRoutes = Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user details
 *     description: Retrieves a user data.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 */
userRoutes.get("/user", async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: "Error occur" });
  }
});

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes a user account based on the provided ID.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
userRoutes.delete("/user", async (req: Request, res: Response) => {
  const { id } = req.user.id;
  try {
    await deleteAccount(Number(id));
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error:any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update user data
 *     description: Updates user information based on provided ID and data.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
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
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request, validation errors
 */
userRoutes.put("/user", async (req: Request, res: Response) => {
  const { id } = req.user;
  const data = req.body;
  try {
    const updatedUser = await updateUserData(Number(id), data);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
export default userRoutes;
