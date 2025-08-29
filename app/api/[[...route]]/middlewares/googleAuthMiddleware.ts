import { Context, Next } from "hono";
import { google, Auth } from "googleapis";
import { prisma } from "~/lib/prisma";

export let cachedTokens: any = null;

export async function updateCachedTokens(tokens: any) {
  cachedTokens = tokens;
  try {
    await prisma.apiKey.upsert({
      where: { name: "googleAuthTokens" },
      update: { tokens: tokens },
      create: { name: "googleAuthTokens", tokens: tokens },
    });
    console.log("Cached tokens updated and saved to DB successfully");
  } catch (error) {
    console.error("Error saving tokens to DB:", error);
  }
}

(async () => {
  try {
    const dbTokens = await prisma.apiKey.findUnique({
      where: { name: "googleAuthTokens" },
    });
    if (dbTokens) {
      cachedTokens = dbTokens.tokens;
    }
  } catch (error) {
    console.warn("Could not load tokens from DB:", error);
  }
})();

function getOAuth2Client() {
  if (
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.REDIRECT_URI
  ) {
    console.error("Missing required OAuth environment variables");
    throw new Error("OAuth environment variables not configured");
  }

  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

async function refreshAccessToken(oAuth2Client: Auth.OAuth2Client) {
  if (cachedTokens) {
    oAuth2Client.setCredentials(cachedTokens);

    try {
      if (
        !oAuth2Client.credentials.access_token ||
        (oAuth2Client.credentials.expiry_date &&
          Date.now() >= oAuth2Client.credentials.expiry_date)
      ) {
        const { credentials: newTokens } =
          await oAuth2Client.refreshAccessToken();
        await updateCachedTokens(newTokens);
        oAuth2Client.setCredentials(newTokens);
      }
    } catch (error) {
      throw new Error("reauthorize");
    }
  } else {
    throw new Error("Authorize by visiting /auth");
  }
}

export const googleAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const oAuth2Client = getOAuth2Client();
    await refreshAccessToken(oAuth2Client);
    c.set("googleAuth", oAuth2Client);
    await next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Authorize by visiting /auth") {
        return c.json(
          {
            error: "Authorization required",
            message: "Authorize by visiting /api/admin/auth",
            authUrl: "/api/admin/auth",
          },
          401,
        );
      } else if (error.message === "reauthorize") {
        return c.json(
          {
            error: "Token expired",
            message: "Please reauthorize by visiting /api/admin/auth",
            authUrl: "/api/admin/auth",
          },
          401,
        );
      } else if (
        error.message === "OAuth environment variables not configured"
      ) {
        return c.json(
          {
            error: "Server configuration error",
            message: "OAuth is not properly configured",
          },
          500,
        );
      }
    }
    return c.json(
      {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
