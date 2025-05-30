"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";

interface Student {
  id: string;
  name: string;
  email: string;
  class?: {
    name: string;
  };
}

interface StudentsListProps {
  onStudentClick?: (studentId: string) => void;
}

const StudentsList = ({ onStudentClick }: StudentsListProps) => {
  const user = useSelector((state: any) => state.auth.user);
  const taughtClasses = user?.taughtClasses || [];
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const students =
    selectedClass === "all"
      ? taughtClasses.flatMap((cls: any) => cls.students || [])
      : taughtClasses.find((cls: any) => cls.id === selectedClass)?.students ||
        [];

  const filteredStudents = students.filter(
    (student: Student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-64">
          <Select
            value={selectedClass}
            onValueChange={(value) => setSelectedClass(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Classes</SelectItem>
                {taughtClasses.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Input
          className="w-full sm:w-auto sm:flex-1"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: Student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.class?.name || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStudentClick?.(student.id)}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-[300px] items-center justify-center p-4">
            <p className="text-center text-muted-foreground">
              No students found.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentsList;
