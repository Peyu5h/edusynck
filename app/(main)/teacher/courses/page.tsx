"use client";

import React from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AddCourseForm from "~/components/teacher/AddCourseForm";

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  professorName: string;
}

export default function CoursesPage() {
  const user = useSelector((state: any) => state.user.user);
  const taughtClasses = user?.taughtClasses || [];
  const allCourses = taughtClasses.flatMap((cls: any) =>
    (cls.courses || []).map((course: Course) => ({
      ...course,
      className: cls.name,
      classId: cls.id,
    })),
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Courses</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Current Courses</TabsTrigger>
          <TabsTrigger value="add">Add New Course</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Manage Courses</CardTitle>
              <CardDescription>
                All courses you're currently teaching across classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allCourses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Professor</TableHead>
                      <TableHead>Google Classroom ID</TableHead>
                      <TableHead>Class</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCourses.map(
                      (
                        course: Course & { className: string; classId: string },
                      ) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            {course.name}
                          </TableCell>
                          <TableCell>{course.professorName}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {course.googleClassroomId}
                          </TableCell>
                          <TableCell>{course.className}</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No courses available. Use the "Add New Course" tab to create
                  your first course.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <AddCourseForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
