"use client";

import { useSelector } from "react-redux";
import { PiBookOpenTextLight } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { FaChalkboardTeacher } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import StudentsList from "./StudentsList";
import AddCourseForm from "./AddCourseForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ClassItem {
  id: string;
  name: string;
  students?: Array<{ id: string; name: string; email: string }>;
  courses?: Array<{ id: string; name: string }>;
}

export default function TeacherDashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("summary");

  if (!user) {
    return <div>Loading...</div>;
  }

  const classCount = user.taughtClasses?.length || 0;

  // Calculate students from all taught classes
  const allStudents =
    user.taughtClasses?.flatMap(
      (classItem: ClassItem) => classItem.students || [],
    ) || [];

  // Get unique students by ID
  const uniqueStudentIds = new Set(
    allStudents.map((student: { id: string }) => student.id),
  );
  const totalStudents = uniqueStudentIds.size;

  // Calculate total courses from all taught classes
  const allCourses =
    user.taughtClasses?.flatMap(
      (classItem: ClassItem) => classItem.courses || [],
    ) || [];
  const totalCourses = allCourses.length;

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Teacher Dashboard</h1>

      <Tabs
        defaultValue="summary"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Dashboard</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Manage Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{classCount}</span>
                  <SiGoogleclassroom className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Classes you are teaching
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{totalStudents}</span>
                  <HiOutlineUserGroup className="h-9 w-9 text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total students in your classes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{totalCourses}</span>
                  <PiBookOpenTextLight className="h-9 w-9 text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total courses you manage
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <StudentsList
            onStudentClick={(studentId) => router.push(`/user/${studentId}`)}
          />
        </TabsContent>

        <TabsContent value="courses">
          <AddCourseForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
