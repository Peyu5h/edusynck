import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userClassRoutes from "../routes/userClassRoutes.js";
dotenv.config();
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors({ origin: "*" }));
const port = parseInt(process.env.PORT || "8000", 10);
const SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/drive.readonly",
];
const TOKEN_PATH = path.join(__dirname, "key.json");
const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
app.get("/", (req, res) => {
    res.send("Helloo");
});
app.get("/auth", (req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
    });
    res.redirect(authorizeUrl);
});
app.get("/oauth2callback", async (req, res) => {
    const code = req.query.code;
    if (typeof code === "string") {
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            oAuth2Client.setCredentials(tokens);
            res.send("Authorization successful! You can now access the API.");
        }
        catch (error) {
            console.error("Error exchanging authorization code for tokens:", error);
            res.status(500).send("Error during authorization");
        }
    }
    else {
        res.status(400).send("Invalid authorization code");
    }
});
app.use("/api", userClassRoutes);
app.get("/courses", async (req, res) => {
    try {
        await refreshAccessToken();
        const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
        const response = await classroom.courses.list({
            pageSize: 10,
            fields: "courses(id,name,courseState),nextPageToken",
        });
        if (response.data && response.data.courses) {
            res.json(response.data.courses);
        }
        else {
            res.json({ message: "No courses found" });
        }
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({
            error: "Failed to fetch courses",
            message: error.message,
        });
    }
});
app.get("/course/:id/assignments", async (req, res) => {
    const { id } = req.params;
    try {
        await refreshAccessToken();
        const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
        const assignmentsResponse = await classroom.courses.courseWork.list({
            courseId: id,
            pageSize: 10,
            fields: "courseWork(id,title,description,dueDate,dueTime,materials,alternateLink)",
        });
        res.json(assignmentsResponse.data.courseWork);
    }
    catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({
            error: "Failed to fetch assignments",
            message: error.message,
        });
    }
});
app.get("/file/:fileId", async (req, res) => {
    const { fileId } = req.params;
    try {
        await refreshAccessToken();
        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: "id, name, mimeType",
        });
        const fileContent = await drive.files.get({
            fileId: fileId,
            alt: "media",
        }, { responseType: "stream" });
        res.setHeader("Content-Type", fileMetadata.data.mimeType);
        fileContent.data.pipe(res);
    }
    catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({
            error: "Failed to fetch file",
            message: error.message,
        });
    }
});
async function refreshAccessToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
        oAuth2Client.setCredentials(tokens);
        try {
            if (!oAuth2Client.credentials ||
                !oAuth2Client.credentials.expiry_date ||
                oAuth2Client.credentials.expiry_date < Date.now()) {
                const { credentials: newTokens } = await oAuth2Client.refreshAccessToken();
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens));
                oAuth2Client.setCredentials(newTokens);
            }
        }
        catch (error) {
            console.error("Error refreshing access token:", error);
            fs.unlinkSync(TOKEN_PATH);
            throw new Error("Reauthorization required");
        }
    }
}
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
