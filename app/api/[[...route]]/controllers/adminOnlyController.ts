import { Context } from "hono";
import { google } from "googleapis";
import fs from "fs";
import path, { extname } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import { prisma } from "~/lib/prisma";
import { getTextExtractor } from "office-text-extractor";
import {
  formatDueDate,
  getFileType,
  organizeAssignmentMaterials,
  parseDueDate,
} from "../utils/functions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
];

const TOKEN_PATH = path.join(__dirname, "..", "config", "key.json");

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

export const auth = async (c: Context) => {
  const oAuth2Client = getOAuth2Client();
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  return c.redirect(authorizeUrl);
};

export const oauth2callback = async (c: Context) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json({ error: "Invalid authorization code" }, 400);
  }

  try {
    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    oAuth2Client.setCredentials(tokens);
    return c.text("Done :)");
  } catch (error) {
    console.error("failed", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const allCourses = async (c: Context) => {
  try {
    const oAuth2Client = c.get("googleAuth");
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
    const response = await classroom.courses.list({
      pageSize: 10,
      fields: "courses(id,name,courseState),nextPageToken",
    });

    if (response.data?.courses) {
      return c.json(response.data.courses);
    }
    return c.json({ message: "No courses found" });
  } catch (error) {
    console.error("failed:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getFile = async (c: Context) => {
  const fileId = c.req.param("fileId");

  try {
    const oAuth2Client = c.get("googleAuth");
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileMetadata = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const fileContent = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" },
    );

    c.header("Content-Type", fileMetadata.data.mimeType!);
    return c.body(fileContent.data as ArrayBuffer);
  } catch (error) {
    console.error("Error fetching file:", error);
    return c.json(
      {
        error: "Failed to fetch file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getAllAssignments = async (c: Context) => {
  const classId = c.req.param("classId");
  const oAuth2Client = c.get("googleAuth");

  try {
    const courses = await prisma.course.findMany({
      where: { classId },
      select: { googleClassroomId: true, name: true },
    });

    if (!courses?.length) {
      return c.json({ error: "No courses found for this class" }, 404);
    }

    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    const fetchCourseAssignments = async (course: {
      googleClassroomId: string;
      name: string;
    }) => {
      const { data: { courseWork = [] } = {} } =
        await classroom.courses.courseWork.list({
          courseId: course.googleClassroomId,
          pageSize: 20,
          fields:
            "courseWork(id,title,description,dueDate,dueTime,materials,alternateLink)",
        });

      return courseWork.map((ga) => {
        const dueDate = parseDueDate(ga.dueDate, ga.dueTime);
        const formattedDueDate = formatDueDate(dueDate);
        return {
          googleId: ga.id,
          title: ga.title,
          description: ga.description,
          dueDate: formattedDueDate,
          alternateLink: ga.alternateLink,
          materials: organizeAssignmentMaterials(ga.materials),
          type: ga.materials?.[0]?.driveFile?.driveFile?.title
            ? getFileType(
                extname(ga.materials[0].driveFile.driveFile.title)
                  .toLowerCase()
                  .slice(1),
              )
            : null,
          thumbnail:
            ga.materials?.[0]?.driveFile?.driveFile?.thumbnailUrl || null,
          courseName: course.name,
        };
      });
    };

    const allAssignments = await Promise.all(
      courses.map(fetchCourseAssignments),
    );
    return c.json(allAssignments.flat());
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    return c.json(
      {
        error: "Failed to fetch assignments",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

const imageCache = new NodeCache({ stdTTL: 3600 });

export const getImage = async (c: Context) => {
  const thumbnailUrl = c.req.query("thumbnailUrl");

  if (!thumbnailUrl) {
    return c.json({ error: "Thumbnail URL is required" }, 400);
  }

  try {
    const cachedImage = imageCache.get(thumbnailUrl);
    if (cachedImage) {
      c.header("Content-Type", (cachedImage as { mimeType: string }).mimeType);
      return c.body((cachedImage as { data: any }).data);
    }

    const oAuth2Client = c.get("googleAuth");
    if (!oAuth2Client) {
      throw new Error("OAuth2 client not found");
    }

    if (oAuth2Client.isTokenExpiring()) {
      await oAuth2Client.refreshAccessToken();
    }

    const response = await fetch(thumbnailUrl, {
      headers: {
        Authorization: `Bearer ${oAuth2Client.credentials.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const imageBuffer = await response.buffer();

    imageCache.set(thumbnailUrl, {
      mimeType: contentType,
      data: imageBuffer,
    });

    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    c.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    c.header("Content-Type", contentType!);
    return c.body(imageBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    return c.json(
      {
        error: "Failed to fetch image",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

const extractor = getTextExtractor();

export const extractTextFromPptxUrl = async (c: Context) => {
  const url = c.req.query("url");

  if (!url) {
    return c.json({ error: "URL query parameter is required" }, 400);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const text = await extractor.extractText({ input: buffer, type: "buffer" });

    return c.json({ text });
  } catch (error) {
    console.error("Error processing PPTX file:", error);
    return c.json(
      {
        error: "Failed to process PPTX file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getYoutubeVideos = async (c: Context) => {
  const { keywords } = await c.req.json();

  if (!keywords || typeof keywords !== "string") {
    return c.json({ error: "Keywords are required" }, 400);
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        keywords,
      )}&type=video&maxResults=4&key=${YOUTUBE_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error("YouTube API request failed");
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return c.json(
      {
        error: "Failed to fetch YouTube videos",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
