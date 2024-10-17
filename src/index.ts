import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import userRoutes from "@/routes/user";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is running" });
});

// User routes
app.use("/users", userRoutes);

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
