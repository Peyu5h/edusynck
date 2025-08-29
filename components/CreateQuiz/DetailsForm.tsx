"use client";

import React from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";

interface DetailsFormProps {
  courses: any[];
  values: {
    title: string;
    description: string;
    courseId: string;
    isTimeLimited: boolean;
    duration: string;
    startTime: string;
    endTime: string;
  };
  errors: Record<string, any>;
  touched: Record<string, any>;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  aiEnabled: boolean;
  onToggleAi: (checked: boolean) => void;
}

const DetailsForm: React.FC<DetailsFormProps> = ({
  courses,
  values,
  errors,
  touched,
  onChange,
  onBlur,
  setFieldValue,
  aiEnabled,
  onToggleAi,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quiz Details</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="aiEnabled"
            checked={aiEnabled}
            onCheckedChange={onToggleAi}
          />
          <Label htmlFor="aiEnabled">AI assistance</Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={values.title}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Enter quiz title"
              />
              {touched.title && errors.title ? (
                <div className="text-red-500 mt-1 text-sm">
                  {errors.title as string}
                </div>
              ) : null}
            </div>

            <div>
              <Label htmlFor="courseId">Course</Label>
              <select
                id="courseId"
                name="courseId"
                value={values.courseId}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full rounded-md border p-2"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {touched.courseId && errors.courseId ? (
                <div className="text-red-500 mt-1 text-sm">
                  {errors.courseId as string}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="startTime">Start Time (Optional)</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={values.startTime}
                  onChange={onChange}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={values.endTime}
                  onChange={onChange}
                />
              </div>

              <div className="">
                <div className="mt-12 flex items-center space-x-2">
                  <Switch
                    id="isTimeLimited"
                    checked={values.isTimeLimited}
                    className=""
                    onCheckedChange={(checked) =>
                      setFieldValue("isTimeLimited", checked)
                    }
                  />
                  <Label htmlFor="isTimeLimited">Time limited quiz</Label>
                </div>
              </div>
              {values.isTimeLimited && (
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={values.duration}
                    onChange={onChange}
                    placeholder="Enter quiz duration in minutes"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={values.description}
            onChange={onChange}
            placeholder="Enter quiz description"
            className="border-0 border-none bg-accent"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailsForm;
