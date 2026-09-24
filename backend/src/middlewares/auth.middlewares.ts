import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asycHandler.js";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload | string;
    }
  }
}

const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.body?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized request",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      );

      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired access token",
      });
    }
  }
);

export { verifyJWT };