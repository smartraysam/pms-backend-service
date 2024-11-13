import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import userRoutes from "@/routes/user";
import { requestLogger, errorHandler, authenticate } from "./middleware"; // Import middleware
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import accessRoutes from "@/routes/access-control";
import vehicleRoutes from "@/routes/vehicle";
import tagRoutes from "@/routes/tags";
import queueRoutes from "./routes/queue";
import parkActivityRoutes from "./routes/park-activites";
import authRoutes from "./routes/auth";
import fleetRoutes from "./routes/fleet";
import locationRoutes from "./routes/location";

const app = express();
const prisma = new PrismaClient();

// Middleware to parse JSON requests
app.use(express.json());
app.use(requestLogger);
app.use(errorHandler);
// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is running" });
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", authRoutes);

app.use(authenticate);
app.use("/api", userRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", tagRoutes);
app.use("/api", queueRoutes);
app.use("/api", parkActivityRoutes);
app.use("/api", accessRoutes);
app.use("/api", fleetRoutes);

app.use("/api", locationRoutes);
// Gracefully handle Prisma shutdown on server stop
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected");
  process.exit(0);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
});
