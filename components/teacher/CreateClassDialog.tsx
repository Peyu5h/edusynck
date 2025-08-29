"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2, Users, Check, AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  useGoogleClassroomCourses,
  useCreateClass,
} from "~/hooks/useGoogleClassroom";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateClassDialog({
  open,
  onOpenChange,
}: CreateClassDialogProps) {
  const [className, setClassName] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const {
    data: googleCourses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useGoogleClassroomCourses(open);

  const createClassMutation = useCreateClass();

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleSubmit = async () => {
    if (!className.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    if (!classNumber.trim()) {
      toast.error("Please enter a class number");
      return;
    }

    try {
      await createClassMutation.mutateAsync({
        name: className.trim(),
        classNumber: classNumber.trim(),
        selectedCourses,
      });

      const courseText = selectedCourses.length === 1 ? "course" : "courses";
      const courseMessage =
        selectedCourses.length > 0
          ? ` with ${selectedCourses.length} ${courseText}`
          : "";

      toast.success(
        `Successfully created class "${className}"${courseMessage}`,
        {
          duration: 4000,
        },
      );

      setClassName("");
      setClassNumber("");
      setSelectedCourses([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create class");
    }
  };

  const handleClose = () => {
    setClassName("");
    setClassNumber("");
    setSelectedCourses([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Class
          </DialogTitle>
          <DialogDescription>
            Create a new class and optionally add Google Classroom courses to it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., Computer Science 101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classNumber">Class Number</Label>
              <Input
                id="classNumber"
                value={classNumber}
                onChange={(e) => setClassNumber(e.target.value)}
                placeholder="e.g., CS101"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Google Classroom Courses (Optional)</Label>
              {selectedCourses.length > 0 && (
                <Badge variant="secondary">
                  {selectedCourses.length} selected
                </Badge>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border p-4">
              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">
                    Loading Google Classroom courses...
                  </span>
                </div>
              ) : coursesError ? (
                <div className="flex items-center justify-center py-8 text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>
                    Failed to load courses. You can create the class and add
                    courses later.
                  </span>
                </div>
              ) : !googleCourses || googleCourses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No Google Classroom courses found</p>
                  <p className="text-sm">
                    You can create the class and add courses later
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Select courses to add to this class (you can add more later)
                  </p>
                  <div className="grid gap-3">
                    {googleCourses.map((course: any) => (
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
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !className.trim() ||
              !classNumber.trim() ||
              createClassMutation.isPending
            }
          >
            {createClassMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Class
            {selectedCourses.length > 0 &&
              ` with ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
