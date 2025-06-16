import { NextRequest } from "next/server";
import { handle } from "hono/vercel";
import { app } from "../[[...route]]/route";

// Debug info route
export async function GET(
  req: NextRequest,
  { params }: { params: { catchAll: string[] } },
) {
  console.log("Catch-all route hit with path:", params.catchAll);
  return handle(app)(req);
}

export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const HEAD = handle(app);
export const OPTIONS = handle(app);
