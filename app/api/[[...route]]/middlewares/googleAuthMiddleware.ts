import { Context, Next } from "hono";
import { google, Auth } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load the token from the committed key.json file if it exists
export let cachedTokens: any = null;

// Function to update the cached tokens
export function updateCachedTokens(tokens: any) {
  cachedTokens = tokens;
}

// Try to read from the key.json file if it exists at build time
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const CONFIG_DIR = path.join(__dirname, "..", "config");
  const TOKEN_PATH = path.join(CONFIG_DIR, "key.json");

  if (fs.existsSync(TOKEN_PATH)) {
    cachedTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    console.log("Loaded auth tokens from key.json");
  }
} catch (error) {
  console.warn("Could not load tokens from file system:", error);
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

async function refreshAccessToken(oAuth2Client: Auth.OAuth2Client) {
  // Use the cached tokens from the startup read
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
        // Update the cached tokens using the function
        updateCachedTokens(newTokens);
        oAuth2Client.setCredentials(newTokens);
      }
    } catch (error) {
      console.error("Unable to refresh access token:", error);
      throw new Error("reauthorize");
    }
  } else {
    // No tokens available
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
    console.error("Google Auth Middleware Error:", error);
    if (error instanceof Error) {
      if (error.message === "Authorize by visiting /auth") {
        return c.json(
          {
            error: "Authorization required",
            message: "Authorize by visiting /auth",
          },
          401,
        );
      } else if (error.message === "reauthorize") {
        return c.json(
          {
            error: "Token expired",
            message: "Please reauthorize by visiting /auth",
          },
          401,
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
