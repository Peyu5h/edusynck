import prisma from "../config/db.js";
import { google } from "googleapis";
import {
  formatDueDate,
  getFileType,
  organizeAssignmentMaterials,
  parseDueDate,
} from "../utils/functions.js";
import { extname } from "path";

export const create = async (req, res) => {
  try {
    const { name, classNumber } = req.body;

    const newClass = await prisma.class.create({
      data: {
        name,
        classNumber,
      },
    });

    res.status(201).json({ message: "success", classId: newClass.id });
  } catch (error) {
    res.status(500).json({ error: "failed", message: error.message });
  }
};

export const assignCourse = async (req, res) => {
  const { classId } = req.params;
  const { courseIds } = req.body;

  try {
    const oAuth2Client = req["googleAuth"];
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    for (const googleClassroomId of courseIds) {
      const courseDetails = await classroom.courses.get({
        id: googleClassroomId,
        fields: "id,name",
      });

      await prisma.course.create({
        data: {
          name: courseDetails.data.name || "",
          googleClassroomId: courseDetails.data.id || "",
          classId: classId || "",
        },
      });
    }

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ error: "failed", message: error.message });
  }
};

export const getCourses = async (req, res) => {
  const { classId } = req.params;

  try {
    const courses = await prisma.course.findMany({
      where: { classId },
    });

    const oAuth2Client = req["googleAuth"];
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    const coursesWithTeachers = await Promise.all(
      courses?.map(async (course) => {
        try {
          if (!course?.professorName || !course?.professorProfilePicture) {
            const teachersResponse = await classroom.courses.teachers.list({
              courseId: course?.googleClassroomId,
            });
            const primaryTeacher = teachersResponse.data.teachers[0];

            await prisma.course.update({
              where: { id: course.id },
              data: {
                professorName: primaryTeacher?.profile?.name?.fullName || "",
                professorProfilePicture:
                  primaryTeacher?.profile?.photoUrl || "",
              },
            });

            return {
              ...course,
              professorName: primaryTeacher?.profile?.name?.fullName || "",
              professorProfilePicture: primaryTeacher?.profile?.photoUrl || "",
            };
          } else {
            return course;
          }
        } catch (courseError) {
          console.error(
            `Error fetching teachers for course ${course.googleClassroomId}:`,
            courseError.message,
          );
          return {
            ...course,
            professorName: "Unable to fetch",
            professorProfilePicture: "",
            error: courseError.message,
          };
        }
      }),
    );
    res.status(200).json(coursesWithTeachers);
  } catch (error) {
    console.error("Error in getCourses:", error);
    res.status(500).json({
      error: "failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getAssignments = async (req, res) => {
  const { courseId } = req.params;

  try {
    const oAuth2Client = req["googleAuth"];
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    const { data: { courseWork = [] } = {} } =
      await classroom.courses.courseWork.list({
        courseId,
        pageSize: 20,
        fields:
          "courseWork(id,title,description,dueDate,dueTime,materials,alternateLink)",
      });

    const organizedAssignments = await Promise.all(
      courseWork.map(async (ga) => {
        const dueDate = parseDueDate(ga.dueDate, ga.dueTime);
        const formattedDueDate = formatDueDate(dueDate);

        const localAssignment = await prisma.assignment.upsert({
          where: { googleId: ga.id },
          update: { title: ga.title, description: ga.description, dueDate },
          create: {
            googleId: ga.id,
            title: ga.title,
            description: ga.description,
            dueDate,
            courseId,
          },
        });

        const solutions = await prisma.solution.findMany({
          where: { assignmentId: localAssignment.id },
          select: {
            documentUrl: true,
            user: { select: { id: true, name: true } },
          },
        });

        return {
          id: localAssignment.id,
          googleId: ga.id,
          title: ga.title,
          description: ga.description,
          dueDate: formattedDueDate,
          alternateLink: ga.alternateLink,
          materials: organizeAssignmentMaterials(ga.materials),
          solutions: solutions.map((s) => ({
            userId: s.user?.id,
            userName: s.user?.name,
            documentUrl: s.documentUrl,
          })),
        };
      }),
    );

    res.json(organizedAssignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch assignments", message: error.message });
  }
};

export const getMaterials = async (req, res) => {
  const { courseId } = req.params;

  try {
    const oAuth2Client = req["googleAuth"];
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
    const materialsResponse = await classroom.courses.courseWorkMaterials.list({
      courseId: courseId,
      pageSize: 10,
      fields: "courseWorkMaterial(id,title,materials,alternateLink)",
    });

    const organizedMaterials = materialsResponse.data.courseWorkMaterial.map(
      (material) => {
        const organizedContent = {
          id: material.id,
          title: material.title,
          alternateLink: material.alternateLink,
          links: [],
          files: [],
        };

        if (material.materials) {
          material.materials.forEach((item) => {
            if (item.link) {
              organizedContent.links.push({
                url: item.link.url,
                title: item.link.title,
                thumbnailUrl: item.link.thumbnailUrl,
              });
            } else if (item.driveFile) {
              const file = item.driveFile.driveFile;
              const extension = extname(file.title).toLowerCase().slice(1);
              organizedContent.files.push({
                id: file.id,
                title: file.title,
                alternateLink: file.alternateLink,
                thumbnailUrl: file.thumbnailUrl,
                extension: extension,
                type: getFileType(extension),
              });
            }
          });
        }

        return organizedContent;
      },
    );

    res.json(organizedMaterials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({
      error: "Failed to fetch materials",
      message: error.message,
    });
  }
};
