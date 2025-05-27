import { google } from "googleapis";
import fs from "fs";
import path, { extname } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import prisma from "../config/db.js";

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

export const getAllAssignments = async (req, res) => {
  const { classId } = req.params;
  const oAuth2Client = req["googleAuth"];
  try {
    // Fetch all courses for the given classId
    const courses = await prisma.course.findMany({
      where: { classId },
      select: { googleClassroomId: true, name: true },
    });
    if (!courses || courses.length === 0) {
      return res.status(404).json({ error: "No courses found for this class" });
    }
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
    // Function to fetch assignments for a single course
    const fetchCourseAssignments = async (course) => {
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
          type:
            ga.materials && ga.materials[0]?.driveFile?.driveFile?.title
              ? getFileType(
                  extname(ga.materials[0].driveFile.driveFile.title)
                    .toLowerCase()
                    .slice(1),
                )
              : null,
          thumbnail:
            (ga.materials &&
              ga.materials[0]?.driveFile?.driveFile?.thumbnailUrl) ||
            null,
          courseName: course.name,
        };
      });
    };
    // Fetch assignments for all courses concurrently
    const allAssignments = await Promise.all(
      courses.map((course) => fetchCourseAssignments(course)),
    );
    // Flatten the array of assignments
    const flattenedAssignments = allAssignments.flat();
    res.json(flattenedAssignments);
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch assignments", message: error.message });
  }
};

const imageCache = new NodeCache({ stdTTL: 3600 });

export const getImage = async (req, res) => {
  const { thumbnailUrl } = req.query;

  if (!thumbnailUrl) {
    return res.status(400).json({ error: "Thumbnail URL is required" });
  }

  try {
    // Check if cache
    const cachedImage = imageCache.get(thumbnailUrl);
    if (cachedImage) {
      res.setHeader(
        "Content-Type",
        (cachedImage as { mimeType: string }).mimeType,
      );
      res.send((cachedImage as { data: any }).data);
      return;
    }

    const oAuth2Client = req["googleAuth"];
    if (!oAuth2Client) {
      throw new Error("OAuth2 client not found");
    }

    if (oAuth2Client.isTokenExpiring()) {
      await oAuth2Client.refreshAccessToken();
    }

    // Fetch image
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

    // Cache image
    imageCache.set(thumbnailUrl, {
      mimeType: contentType,
      data: imageBuffer,
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );

    res.setHeader("Content-Type", contentType);
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({
      error: "Failed to fetch image",
      message: error.message,
    });
  }
};

import { getTextExtractor } from "office-text-extractor";
import {
  formatDueDate,
  getFileType,
  organizeAssignmentMaterials,
  parseDueDate,
} from "../utils/functions.js";

const extractor = getTextExtractor();

export const extractTextFromPptxUrl = async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res
      .status(400)
      .json({ error: "URL query parameter is required and must be a string" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const buffer = await response.buffer();

    const text = await extractor.extractText({ input: buffer, type: "buffer" });

    res.json({ text });
  } catch (error) {
    console.error("Error processing PPTX file:", error);
    res
      .status(500)
      .json({ error: "Failed to process PPTX file", message: error.message });
  }
};

export const getYoutubeVideos = async (req, res) => {
  const { keywords } = req.body;

  if (!keywords || typeof keywords !== "string") {
    return res.status(400).json({ error: "Keywords are required" });
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
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
};
