import { Router, Request, Response } from "express";
import {
  changePassword,
  forgotPassword,
  login,
  registerAdmin,
  resetPassword,
} from "@/models/user.model";

const authRoutes = Router();

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
authRoutes.post("/auth/register", async (req: Request, res: Response) => {
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
    console.log(error);
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
authRoutes.post("/auth/login", async (req: Request, res: Response) => {
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
authRoutes.post("/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
   const token = await forgotPassword(email);
    res.status(200).json({token, message: "Password reset token sent to email" });
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
authRoutes.post("/auth/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    await resetPassword({ token, password });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});


export default authRoutes;
