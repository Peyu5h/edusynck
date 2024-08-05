import prisma from "../config/db.js";
import { google } from "googleapis";
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: "failed", message: error.message });
    }
};
export const getCourses = async (req, res) => {
    const { classId } = req.params;
    try {
        const courses = await prisma.course.findMany({
            where: { classId },
        });
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ error: "failed", message: error.message });
    }
};
