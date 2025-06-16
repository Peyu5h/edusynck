import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

interface JwtPayload {
  userId: string;
}

export const jwtMiddleware = async (c: Context, next: Next) => {
  try {
    // Allow OPTIONS requests to pass through for CORS pre-flight
    if (c.req.method === "OPTIONS") {
      await next();
      return;
    }

    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];

    if (!SECRET_KEY) {
      console.error("JWT_SECRET environment variable not set");
      return c.json({ error: "Server configuration error" }, 500);
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
      c.set("user", decoded);
      await next();
    } catch (err) {
      console.error("JWT verification failed:", err);

      // Be more specific about token errors
      if (err instanceof jwt.TokenExpiredError) {
        return c.json({ error: "Token expired" }, 401);
      } else if (err instanceof jwt.JsonWebTokenError) {
        return c.json({ error: "Invalid token" }, 401);
      }

      return c.json({ error: "Invalid token" }, 401);
    }
  } catch (error) {
    console.error("JWT middleware error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
};
