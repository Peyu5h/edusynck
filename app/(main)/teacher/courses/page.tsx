"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
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
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Users, BookOpen, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { hydrateUser } from "~/store/slices/userSlice";
import { useDeleteCourse } from "~/hooks/useGoogleClassroom";
import { useCoursesForClasses } from "~/hooks/useGetCourses";
import AddCourseDialog from "~/components/teacher/AddCourseDialog";
import CreateClassDialog from "~/components/teacher/CreateClassDialog";
import DeleteCourseDialog from "~/components/teacher/DeleteCourseDialog";
import { CoursesPageLoader } from "~/components/Loaders";

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  professorName?: string;
}

export default function CoursesPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const taughtClasses = user?.taughtClasses || [];
  const classIds = taughtClasses.map((c: any) => c.id);
  const { data: fetchedCourses, isLoading: isCoursesLoading } =
    useCoursesForClasses(classIds);

  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showCreateClassDialog, setShowCreateClassDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<
    (Course & { classId: string; className: string }) | null
  >(null);

  const deleteCoursesMutation = useDeleteCourse();

  const refreshUserData = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      dispatch(hydrateUser(response.data));
      localStorage.setItem("user", JSON.stringify(response.data));

      return true;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return false;
    }
  };

  const openDeleteDialog = (
    course: Course & { classId: string; className: string },
  ) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCoursesMutation.mutateAsync({
        classId: courseToDelete.classId,
        courseId: courseToDelete.id,
      });
      const refreshSuccess = await refreshUserData();

      if (refreshSuccess) {
        toast.success(
          `Successfully deleted "${courseToDelete.name}" from ${courseToDelete.className}`,
          {
            duration: 4000,
          },
        );
      } else {
        toast.error(
          "Course deleted but failed to refresh data. Please refresh the page.",
        );
      }

      setShowDeleteDialog(false);
      setCourseToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  const classIdToName = new Map(
    taughtClasses.map((cls: any) => [cls.id, cls.name] as const),
  );
  const allCourses = (fetchedCourses || []).map((course: any) => ({
    ...course,
    className: classIdToName.get(course.classId) || "",
  }));

  if (!user || isCoursesLoading) {
    return <CoursesPageLoader />;
  }

  return (
    <div className="bg-bground h-full overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-light text-text">Courses</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddCourseDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateClassDialog(true)}
            className="flex items-center gap-2 border-zinc-700 text-text hover:bg-bground3"
          >
            <Users className="h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      <Card className="h-[calc(100vh-200px)] rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
        <CardHeader className="flex-shrink-0 pb-4">
          <CardTitle className="text-xl font-medium text-text">
            Manage Courses
          </CardTitle>
          <CardDescription className="text-thintext">
            All courses you're currently teaching across your classes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="scrollbar h-full overflow-y-auto px-6 pb-6">
            {allCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700 hover:bg-bground3">
                    <TableHead className="text-text">Course Name</TableHead>
                    <TableHead className="text-text">Class</TableHead>
                    <TableHead className="text-text">
                      Google Classroom
                    </TableHead>
                    <TableHead className="text-text">Professor</TableHead>
                    <TableHead className="text-right text-text">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCourses.map(
                    (
                      course: Course & { className: string; classId: string },
                    ) => (
                      <TableRow
                        key={course.id}
                        className="border-zinc-700 hover:bg-bground3"
                      >
                        <TableCell className="font-medium text-text">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-pri" />
                            {course.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-thintext">
                          <Badge variant="outline" className="border-zinc-700">
                            {course.className}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-thintext">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-bground3 px-2 py-1 text-xs">
                              {course.googleClassroomId}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="text-thintext">
                          {course.professorName || "Not specified"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-zinc-700 text-text hover:bg-bground3"
                              onClick={() =>
                                window.open(
                                  `https://classroom.google.com/c/${course.googleClassroomId}`,
                                  "_blank",
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-600/10 hover:text-red-300"
                              onClick={() => openDeleteDialog(course)}
                              disabled={deleteCoursesMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-thintext opacity-50" />
                  <h3 className="mt-4 text-lg font-medium text-text">
                    No courses found
                  </h3>
                  <p className="mt-2 text-sm text-thintext">
                    Get started by adding courses from Google Classroom or
                    creating a new class
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Button
                      onClick={() => setShowAddCourseDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateClassDialog(true)}
                      className="flex items-center gap-2 border-zinc-700 text-text hover:bg-bground3"
                    >
                      <Users className="h-4 w-4" />
                      Create Class
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddCourseDialog
        open={showAddCourseDialog}
        onOpenChange={setShowAddCourseDialog}
      />
      <CreateClassDialog
        open={showCreateClassDialog}
        onOpenChange={setShowCreateClassDialog}
      />
      <DeleteCourseDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        course={courseToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCoursesMutation.isPending}
      />
    </div>
  );
}
