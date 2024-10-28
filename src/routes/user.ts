import { Router, Request, Response } from "express";
import prisma from "@/lib/prisma";
import { registerAdmin } from "@/models/user.model";

const router = Router();

// Get all users
router.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Create a new user
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: register a new user.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/user", async (req: Request, res: Response) => {
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
      adminId
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Email must be unique" });
  }
});

export default router;
