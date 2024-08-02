import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors({ origin: "*" }));

const port: number = parseInt(process.env.PORT || "8000");

app.use("/api", routes);

// app.get("/course/:id/assignments", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

//     const assignmentsResponse = await classroom.courses.courseWork.list({
//       courseId: id,
//       pageSize: 10,
//       fields:
//         "courseWork(id,title,description,dueDate,dueTime,materials,alternateLink)",
//     });

//     res.json(assignmentsResponse.data.courseWork);
//   } catch (error) {
//     console.error("Error fetching assignments:", error);
//     res.status(500).json({
//       error: "Failed to fetch assignments",
//       message: error.message,
//     });
//   }
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
