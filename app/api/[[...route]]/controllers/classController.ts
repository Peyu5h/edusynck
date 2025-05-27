import { Context } from "hono";
import { google } from "googleapis";
import { prisma } from "~/lib/prisma";
import {
  formatDueDate,
  getFileType,
  organizeAssignmentMaterials,
  parseDueDate,
} from "../utils/functions";
import { extname } from "path";

export const create = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { name, classNumber } = body;

    const newClass = await prisma.class.create({
      data: {
        name,
        classNumber,
      },
    });

    return c.json({ message: "success", classId: newClass.id }, 201);
  } catch (error) {
    console.error("Error creating class:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const assignCourse = async (c: Context) => {
  const classId = c.req.param("classId");
  const { courseIds } = await c.req.json();

  try {
    const oAuth2Client = c.get("googleAuth");
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

    return c.json({ message: "success" });
  } catch (error) {
    console.error("Error assigning course:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getOneCourse = async (c: Context) => {
  const courseId = c.req.param("courseId");

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }

    return c.json(course);
  } catch (error) {
    console.error("Error getting course:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getCourses = async (c: Context) => {
  const classId = c.req.param("classId");

  try {
    const courses = await prisma.course.findMany({
      where: { classId },
    });

    const oAuth2Client = c.get("googleAuth");
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
            courseError instanceof Error
              ? courseError.message
              : "Unknown error",
          );
          return {
            ...course,
            professorName: "Unable to fetch",
            professorProfilePicture: "",
            error:
              courseError instanceof Error
                ? courseError.message
                : "Unknown error",
          };
        }
      }),
    );
    return c.json(coursesWithTeachers);
  } catch (error) {
    console.error("Error in getCourses:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      500,
    );
  }
};

export const getAssignments = async (c: Context) => {
  const courseId = c.req.param("courseId");
  try {
    const oAuth2Client = c.get("googleAuth");
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
          update: {
            title: ga.title,
            description: ga.description,
            dueDate,
            materials: organizeAssignmentMaterials(ga.materials),
            type: getFileType(
              extname(ga.materials[0].driveFile.driveFile.title)
                .toLowerCase()
                .slice(1),
            ),
            thumbnail: ga.materials[0].driveFile.driveFile.thumbnailUrl,
            alternateLink: ga.alternateLink,
            lastUpdated: new Date(),
          },
          create: {
            googleId: ga.id,
            title: ga.title,
            description: ga.description,
            dueDate,
            courseId,
            materials: organizeAssignmentMaterials(ga.materials),
            type: extname(ga.materials[0].driveFile.driveFile.title)
              .toLowerCase()
              .slice(1),
            thumbnail: ga.materials[0].driveFile.driveFile.thumbnailUrl,
            alternateLink: ga.alternateLink,
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
          materials: localAssignment.materials,
          type: localAssignment.type,
          thumbnail: localAssignment.thumbnail,
          solutions: solutions.map((s) => ({
            userId: s.user?.id,
            userName: s.user?.name,
            documentUrl: s.documentUrl,
          })),
        };
      }),
    );

    return c.json(organizedAssignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return c.json(
      {
        error: "Failed to fetch assignments",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getMaterials = async (c: Context) => {
  const courseId = c.req.param("courseId");

  try {
    const oAuth2Client = c.get("googleAuth");
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
          googleClassroomId: courseId,
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

    return c.json(organizedMaterials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return c.json(
      {
        error: "Failed to fetch materials",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getOneMaterial = async (c: Context) => {
  const courseId = c.req.param("courseId");
  const materialId = c.req.param("materialId");

  try {
    const oAuth2Client = c.get("googleAuth");
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    const materialResponse = await classroom.courses.courseWorkMaterials.get({
      courseId: courseId,
      id: materialId,
      fields: "id,title,materials,alternateLink",
    });

    const material = materialResponse.data;
    const organizedContent = {
      id: material.id,
      googleClassroomId: courseId,
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

    return c.json(organizedContent);
  } catch (error) {
    console.error("Error fetching material:", error);
    return c.json(
      {
        error: "Failed to fetch material",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
