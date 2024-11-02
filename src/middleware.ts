import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Replace with env variable in production

// Paths that require authentication
const protectedPaths = [
  "/user",
  "/vehicles",
  "/tag",
  "/queues",
  "/park-activities",
  "/notifications",
];

// Request Logger Middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Authentication Middleware
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
// Error Handling Middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ message: "Internal Server Error" });
};
