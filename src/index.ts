import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import userRoutes from "@/routes/user";
import { requestLogger, errorHandler } from "./middleware"; // Import middleware
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

const app = express();
const prisma = new PrismaClient();

// Middleware to parse JSON requests
app.use(express.json());

// Request Logger Middleware
app.use(requestLogger);

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is running" });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// User Routes
app.use("/users", userRoutes);

// Gracefully handle Prisma shutdown on server stop
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected");
  process.exit(0);
});

// Global Error Handler Middleware
app.use(errorHandler); // Use error handler from middleware.ts

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
