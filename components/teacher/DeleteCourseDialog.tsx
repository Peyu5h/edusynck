"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    id: string;
    name: string;
    className: string;
    classId: string;
  } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteCourseDialog({
  open,
  onOpenChange,
  course,
  onConfirm,
  isDeleting,
}: DeleteCourseDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-600/10 flex h-10 w-10 items-center justify-center rounded-full">
              <AlertTriangle className="text-red-500 h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Course</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{course.name}</span>{" "}
            from{" "}
            <span className="font-medium text-foreground">
              {course.className}
            </span>
            ?
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
