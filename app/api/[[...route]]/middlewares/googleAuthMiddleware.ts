import { Context, Next } from "hono";
import { google, Auth } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, "..", "config", "key.json");

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

async function refreshAccessToken(oAuth2Client: Auth.OAuth2Client) {
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(tokens);

    try {
      if (
        !oAuth2Client.credentials.access_token ||
        (oAuth2Client.credentials.expiry_date &&
          Date.now() >= oAuth2Client.credentials.expiry_date)
      ) {
        const { credentials: newTokens } =
          await oAuth2Client.refreshAccessToken();
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens));
        oAuth2Client.setCredentials(newTokens);
      }
    } catch (error) {
      console.error("Unable to refresh access token:", error);
      fs.unlinkSync(TOKEN_PATH);
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
