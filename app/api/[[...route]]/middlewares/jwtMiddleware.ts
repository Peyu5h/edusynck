import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

interface JwtPayload {
  id: string;
  email: string;
}

export const jwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded: JwtPayload | undefined) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req["user"] = decoded;
    next();
  });
};
