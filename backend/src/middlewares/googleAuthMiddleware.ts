import { Request, Response, NextFunction } from "express";
import { google } from "googleapis";
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

async function refreshAccessToken(oAuth2Client) {
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(tokens);

    try {
      if (
        !oAuth2Client.credentials.access_token ||
        oAuth2Client.isTokenExpiring()
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

export const googleAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oAuth2Client = getOAuth2Client();
    await refreshAccessToken(oAuth2Client);
    req["googleAuth"] = oAuth2Client;
    next();
  } catch (error) {
    if (error.message === "Authorize by visiting /auth") {
      res.status(401).json({
        error: "Authorization required",
        message: "Authorize by visiting /auth",
      });
    } else {
      res.status(500).json({
        error: "failed",
        message: error.message,
      });
    }
  }
};
