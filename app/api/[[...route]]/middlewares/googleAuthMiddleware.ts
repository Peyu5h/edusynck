import { Context, Next } from "hono";
import { google, Auth } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure config directory exists
const CONFIG_DIR = path.join(__dirname, "..", "config");
const TOKEN_PATH = path.join(CONFIG_DIR, "key.json");

// Create a function to ensure the config directory exists
function ensureConfigDirExists() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      console.log(`Created config directory at: ${CONFIG_DIR}`);
    }
  } catch (error) {
    console.error(`Failed to create config directory: ${error}`);
    // Fall back to tmp directory if we can't create in the app directory
    const tmpDir = path.join(process.cwd(), "tmp", "config");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  }
  return CONFIG_DIR;
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

async function refreshAccessToken(oAuth2Client: Auth.OAuth2Client) {
  // Ensure config directory exists before checking for token file
  const configDir = ensureConfigDirExists();
  const tokenPath = path.join(configDir, "key.json");

  if (fs.existsSync(tokenPath)) {
    const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
    oAuth2Client.setCredentials(tokens);

    try {
      if (
        !oAuth2Client.credentials.access_token ||
        (oAuth2Client.credentials.expiry_date &&
          Date.now() >= oAuth2Client.credentials.expiry_date)
      ) {
        const { credentials: newTokens } =
          await oAuth2Client.refreshAccessToken();
        fs.writeFileSync(tokenPath, JSON.stringify(newTokens));
        oAuth2Client.setCredentials(newTokens);
      }
    } catch (error) {
      console.error("Unable to refresh access token:", error);
      try {
        fs.unlinkSync(tokenPath);
      } catch (unlinkErr) {
        console.error("Failed to remove invalid token file:", unlinkErr);
      }
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
