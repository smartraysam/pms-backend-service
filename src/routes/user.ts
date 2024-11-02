import { changePassword, deleteAccount, getUser, updateUserData } from "@/models/user.model";
import { Router, Request, Response } from "express";
const userRoutes = Router();

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
 * /api/user:
 *   get:
 *     summary: Get user details
 *     description: Retrieves a user data.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
    const user = await getUser(Number(req.user.userId));
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error occur" });
  }
});

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes a user account.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
userRoutes.delete("/user", async (req: Request, res: Response) => {
  const  id = req.user.userId;
  try {
    await deleteAccount(Number(id));
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
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
  const id = req.user?.userId;
  const data = req.body;
  try {
    const updatedUser = await updateUserData(Number(id), data);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Change password
 *     description: Changes the user's password.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Error occurred
 */
userRoutes.post(
  "/user/change-password",
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    try {
      await changePassword(userId, { currentPassword, newPassword });
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);


export default userRoutes;
