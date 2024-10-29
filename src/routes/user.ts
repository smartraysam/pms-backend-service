import { Router, Request, Response } from "express";
import {
  changePassword,
  forgotPassword,
  getUser,
  getUsers,
  login,
  registerAdmin,
  resetPassword,
} from "@/models/user.model";

const router = Router();

// Get all users
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *                   phone_number:
 *                     type: string
 *                     example: "+123456789"
 *                   role:
 *                     type: string
 *                     example: "user"
 */
router.get("/", async (req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
});

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user by their unique ID.
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
router.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUser(id);

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
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: janedoe@example.com
 *               phone_number:
 *                 type: string
 *                 example: "+987654321"
 *               password:
 *                 type: string
 *                 example: "strongpassword123"
 *               role:
 *                 type: string
 *                 example: "admin"
 *               adminId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Jane Doe
 *                 email:
 *                   type: string
 *                   example: janedoe@example.com
 *                 role:
 *                   type: string
 *                   example: "admin"
 *       400:
 *         description: Bad request - validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email must be unique"
 */
router.post("auth/register", async (req: Request, res: Response) => {
  const { name, email, phone_number, password, role, adminId } = req.body;
  try {
    if (!name || !email || !phone_number || !password || !role)
      throw new Error("Please provide all the fields");

    const user = await registerAdmin({
      name,
      email,
      phone_number,
      password,
      role,
      adminId,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Email must be unique" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns their details upon success.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 */
router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await login({ email, password });

    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "An error occurred during login" });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Sends a password reset token to the user's email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Token sent to email
 *       400:
 *         description: Error occurred
 */
router.post("/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    await forgotPassword(email);
    res.status(200).json({ message: "Password reset token sent to email" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using the provided token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Error occurred
 */
router.post("/auth/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    await resetPassword({ token, password });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/change-password/{userId}:
 *   post:
 *     summary: Change password
 *     description: Changes the user's password.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
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
router.post(
  "/auth/change-password/:userId",
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
      await changePassword(userId, { currentPassword, newPassword });
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
