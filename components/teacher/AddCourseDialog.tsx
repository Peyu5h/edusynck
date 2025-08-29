"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2, BookOpen, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useAvailableGoogleClassroomCourses,
  useAssignCourses,
} from "~/hooks/useGoogleClassroom";
import { hydrateUser } from "~/store/slices/userSlice";
import { useQueryClient } from "@tanstack/react-query";

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCourseDialog({
  open,
  onOpenChange,
}: AddCourseDialogProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const taughtClasses = user?.taughtClasses || [];

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const selectedClass = taughtClasses.find(
    (cls: any) => cls.id === selectedClassId,
  );
  const existingCourses = selectedClass?.courses || [];

  const {
    data: availableCourses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useAvailableGoogleClassroomCourses(
    existingCourses,
    open && !!selectedClassId,
  );

  const assignCoursesMutation = useAssignCourses();
  const queryClient = useQueryClient();

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

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

  const handleSubmit = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }

    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    try {
      await assignCoursesMutation.mutateAsync({
        classId: selectedClassId,
        courseIds: selectedCourses,
      });

      queryClient.invalidateQueries({ queryKey: ["courses", selectedClassId] });

      const refreshSuccess = await refreshUserData();

      if (refreshSuccess) {
        const courseText = selectedCourses.length === 1 ? "course" : "courses";
        toast.success(
          `Successfully added ${selectedCourses.length} ${courseText} to ${selectedClass?.name}`,
          {
            duration: 4000,
          },
        );
      } else {
        toast.error(
          "Courses added but failed to refresh data. Please refresh the page.",
        );
      }

      setSelectedClassId("");
      setSelectedCourses([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add courses");
    }
  };

  const handleClose = () => {
    setSelectedClassId("");
    setSelectedCourses([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Add Courses from Google Classroom
          </DialogTitle>
          <DialogDescription>
            Select a class and choose Google Classroom courses to add to it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Class</label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class to add courses to" />
              </SelectTrigger>
              <SelectContent>
                {taughtClasses.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.courses?.length || 0} courses)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Available Courses</label>
                {selectedCourses.length > 0 && (
                  <Badge variant="secondary">
                    {selectedCourses.length} selected
                  </Badge>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto rounded-lg border p-4">
                {isLoadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : coursesError ? (
                  <div className="flex items-center justify-center py-8 text-destructive">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    <span>Failed to load courses. Please try again.</span>
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No Google Classroom courses found</p>
                    <p className="text-sm">This could mean:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• All courses are already added to this class</li>
                      <li>• Google Classroom integration needs to be set up</li>
                      <li>• No courses exist in your Google Classroom</li>
                    </ul>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open("/api/admin/auth", "_blank")}
                      >
                        Set up Google Classroom
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {availableCourses.map((course: any) => (
                      <Card
                        key={course.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCourses.includes(course.id)
                            ? "bg-primary/5 ring-2 ring-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleCourseToggle(course.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{course.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                ID: {course.id}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {course.courseState || "ACTIVE"}
                              </Badge>
                            </div>
                            {selectedCourses.includes(course.id) && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedClassId ||
              selectedCourses.length === 0 ||
              assignCoursesMutation.isPending
            }
          >
            {assignCoursesMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add {selectedCourses.length} Course
            {selectedCourses.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
