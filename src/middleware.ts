import { Request, Response, NextFunction } from "express";

// Paths that require authentication
const protectedPaths = [
  "/users",
];

// Paths related to authentication (no session required)
const authPaths = [
  "/login",
  "/signup",
  "/health",
  "/",
];

// Request Logger Middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Authentication Middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (protectedPaths.includes(req.path)) {
    if (authHeader === "Bearer my-secret-token") {
      next(); // Valid token, proceed
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    next(); // Path doesn't require authentication
  }
};

// Error Handling Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ message: "Internal Server Error" });
};
