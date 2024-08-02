import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES: string[] = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/drive.readonly",
];

const TOKEN_PATH = path.join(__dirname, "..", "config", "key.json");

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

export const auth = async (req, res) => {
  const oAuth2Client = getOAuth2Client();
  const authorizeUrl: string = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  res.redirect(authorizeUrl);
};

export const oauth2callback = async (req, res) => {
  const code: string | string[] = req.query.code as string | string[];

  if (typeof code === "string") {
    try {
      const oAuth2Client = getOAuth2Client();
      const { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      oAuth2Client.setCredentials(tokens);
      res.send("Done :)");
    } catch (error) {
      console.error("failed", error);
      res.status(500).send("failed");
    }
  } else {
    res.status(400).send("Invalid authorization code");
  }
};

export const allCourses = async (req, res) => {
  try {
    const oAuth2Client = req["googleAuth"];
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
    const response = await classroom.courses.list({
      pageSize: 10,
      fields: "courses(id,name,courseState),nextPageToken",
    });
    if (response.data && response.data.courses) {
      res.json(response.data.courses);
    } else {
      res.json({ message: "No courses found" });
    }
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({
      error: "failed",
      message: error.message,
    });
  }
};

export const getFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const oAuth2Client = req["googleAuth"];

    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: "id, name, mimeType",
    });

    const fileContent = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" },
    );

    res.setHeader("Content-Type", fileMetadata.data.mimeType);
    fileContent.data.pipe(res);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({
      error: "Failed to fetch file",
      message: error.message,
    });
  }
};

export const getAssignments = async (req, res) => {
  const { id } = req.params;

  try {
    const oAuth2Client = req["googleAuth"];

    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    const assignmentsResponse = await classroom.courses.courseWork.list({
      courseId: id,
      pageSize: 10,
      fields:
        "courseWork(id,title,description,dueDate,dueTime,materials,alternateLink)",
    });

    res.json(assignmentsResponse.data.courseWork);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      error: "Failed to fetch assignments",
      message: error.message,
    });
  }
};
