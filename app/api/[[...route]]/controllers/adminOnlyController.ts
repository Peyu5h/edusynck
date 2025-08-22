import { Context } from "hono";
import { google } from "googleapis";
import { prisma } from "~/lib/prisma";
import { updateCachedTokens } from "../middlewares/googleAuthMiddleware";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import { getTextExtractor } from "office-text-extractor";
import {
  formatDueDate,
  getFileType,
  organizeAssignmentMaterials,
  parseDueDate,
  type DueDate,
  type DueTime,
  type Material,
} from "../utils/functions";
import { extname } from "path";

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

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

export const auth = async (c: Context) => {
  try {
    // Check if required environment variables are present
    if (
      !process.env.CLIENT_ID ||
      !process.env.CLIENT_SECRET ||
      !process.env.REDIRECT_URI
    ) {
      console.error("Missing required environment variables for Google OAuth");
      return c.json(
        {
          error: "Configuration error",
          message: "OAuth credentials are not properly configured",
        },
        500,
      );
    }

    const oAuth2Client = getOAuth2Client();
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    return c.redirect(authorizeUrl);
  } catch (error) {
    console.error("Error in auth endpoint:", error);
    return c.json(
      {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const oauth2callback = async (c: Context) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json({ error: "Invalid authorization code" }, 400);
  }

  try {
    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    await updateCachedTokens(tokens);

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
        const dueDate = parseDueDate(
          ga.dueDate as unknown as DueDate | null,
          ga.dueTime as unknown as DueTime | null,
        );
        const formattedDueDate = formatDueDate(dueDate);
        return {
          googleId: ga.id,
          title: ga.title,
          description: ga.description,
          dueDate: formattedDueDate,
          alternateLink: ga.alternateLink,
          materials: organizeAssignmentMaterials(
            ga.materials as unknown as Material[] | undefined,
          ),
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
    return c.body(imageBuffer as unknown as ArrayBuffer);
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
  try {
    const { keywords, maxResults = 6 } = await c.req.json();

    if (!keywords || typeof keywords !== "string") {
      return c.json({ error: "Keywords are required" }, 400);
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is not configured");
      return c.json({ error: "YouTube API key is not configured" }, 500);
    }

    // Ensure maxResults is within YouTube API limits (1-50)
    const validMaxResults = Math.min(
      Math.max(parseInt(maxResults) || 6, 1),
      50,
    );

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      keywords,
    )}&type=video&maxResults=${validMaxResults}&key=${YOUTUBE_API_KEY}`;

    console.log("Making YouTube API request to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("YouTube API Response Status:", response.status);
    console.log(
      "YouTube API Response Headers:",
      JSON.stringify(Object.fromEntries(response.headers.entries())),
    );

    if (!response.ok) {
      console.error("YouTube API error response:", responseText);

      if (response.status === 403) {
        return c.json(
          {
            error: "YouTube API access denied",
            message:
              "Please check if the API key is valid and has the correct permissions. Make sure YouTube Data API v3 is enabled in your Google Cloud Console.",
            details: responseText,
          },
          403,
        );
      }

      throw new Error(
        `YouTube API request failed: ${response.status} ${response.statusText}`,
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse YouTube API response:", responseText);
      throw new Error("Invalid response from YouTube API");
    }

    if (!data.items || !Array.isArray(data.items)) {
      console.error("Unexpected YouTube API response format:", data);
      throw new Error("Unexpected response format from YouTube API");
    }

    // Get video IDs to fetch additional details (duration, view count)
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    if (videoIds) {
      try {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);

        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();

          // Merge the details with the original data
          data.items = data.items.map((item: any) => {
            const details = detailsData.items?.find(
              (detail: any) => detail.id === item.id.videoId,
            );
            return {
              ...item,
              contentDetails: details?.contentDetails,
              statistics: details?.statistics,
            };
          });
        }
      } catch (detailsError) {
        console.warn("Failed to fetch video details:", detailsError);
        // Continue without details if this fails
      }
    }

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
