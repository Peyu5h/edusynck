"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Link from "next/link";
import {
  Users,
  BookOpen,
  CalendarClock,
  Eye,
  Timer,
  FileCheck,
  Trophy,
  Clock,
  Loader2,
} from "lucide-react";
import { SiGoogleclassroom } from "react-icons/si";
import { format, isPast, isFuture } from "date-fns";
import { useTeacherActiveQuizzes } from "~/hooks/useQuizData";
import { TeacherDashboardLoader } from "~/components/Loaders";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  course: {
    name: string;
  };
  _count: {
    questions: number;
    attempts?: number;
  };
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const taughtClasses = user?.taughtClasses || [];

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const courses = user?.taughtClasses
    ? user.taughtClasses.flatMap((cls: any) => cls.courses || [])
    : [];

  const { data: activeQuizzes, isLoading: isLoadingQuizzes } =
    useTeacherActiveQuizzes(courses);

  const activeQuizzesArray = activeQuizzes || [];

  //stats
  const totalStudents = taughtClasses.reduce(
    (acc: number, cls: any) => acc + (cls.students?.length || 0),
    0,
  );

  const totalCourses = taughtClasses.reduce(
    (acc: number, cls: any) => acc + (cls.courses?.length || 0),
    0,
  );

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

  const viewStudentProfile = (studentId: string) => {
    router.push(`/user/${studentId}`);
  };

  const getQuizStatusBadge = (quiz: Quiz) => {
    const now = new Date();
    const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
    const endTime = quiz.endTime ? new Date(quiz.endTime) : null;

    if (quiz.status === "DRAFT") {
      return <Badge variant="secondary">Draft</Badge>;
    }

    if (quiz.status === "COMPLETED") {
      return <Badge variant="outline">Completed</Badge>;
    }

    if (startTime && isFuture(startTime)) {
      return <Badge variant="outline">Upcoming</Badge>;
    }

    if (endTime && isPast(endTime)) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  if (!user || isLoadingQuizzes) {
    return <TeacherDashboardLoader />;
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="mb-4">
        <h1 className="text-3xl font-light text-text">Teacher Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-text">
              Classes
            </CardTitle>
            <CardDescription className="text-thintext">
              Classes you are teaching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-text">
                {taughtClasses.length}
              </span>
              <SiGoogleclassroom className="h-8 w-8 text-pri" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-text">
              Students
            </CardTitle>
            <CardDescription className="text-thintext">
              Total students in your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-text">
                {totalStudents}
              </span>
              <Users className="h-8 w-8 text-pri" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-text">
              Courses
            </CardTitle>
            <CardDescription className="text-thintext">
              Total courses you manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-text">
                {totalCourses}
              </span>
              <BookOpen className="h-8 w-8 text-pri" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-text">
              Active Quizzes
            </CardTitle>
            <CardDescription className="text-thintext">
              Currently running quizzes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-text">
                {activeQuizzesArray.length}
              </span>
              <FileCheck className="h-8 w-8 text-pri" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid h-[calc(100vh-340px)] grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
        <Card className="flex h-full flex-col overflow-hidden rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
          <CardHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-text">
                Active Quizzes
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/quizzes" className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Manage All
                </Link>
              </Button>
            </div>
            <CardDescription className="text-thintext">
              Monitor your active quizzes and student attempts
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="scrollbar h-full overflow-y-auto px-6 pb-6">
              {isLoadingQuizzes ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-pri" />
                </div>
              ) : activeQuizzesArray.length > 0 ? (
                <div className="space-y-4">
                  {activeQuizzesArray.slice(0, 10).map((quiz: Quiz) => (
                    <div
                      key={quiz.id}
                      className="rounded-lg border border-zinc-700 bg-bground3 p-4 transition-colors hover:bg-bground2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="line-clamp-1 font-medium text-text">
                              {quiz.title}
                            </h3>
                            {getQuizStatusBadge(quiz)}
                          </div>
                          <p className="mt-1 text-sm text-thintext">
                            {quiz?.course?.name}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-thintext">
                            <div className="flex items-center gap-1">
                              <FileCheck className="h-3 w-3" />
                              {quiz._count.questions} questions
                            </div>
                            {quiz.duration && (
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {quiz.duration} min
                              </div>
                            )}
                            {quiz._count.attempts !== undefined && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {quiz._count.attempts} attempts
                              </div>
                            )}
                          </div>
                          {quiz.endTime && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-orange">
                              <Clock className="h-3 w-3" />
                              Expires:{" "}
                              {format(new Date(quiz.endTime), "MMM dd, HH:mm")}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/teacher/quizzes/${quiz.id}`)
                          }
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <div className="text-center">
                    <FileCheck className="mx-auto h-8 w-8 text-thintext" />
                    <p className="mt-2 text-sm text-thintext">
                      No active quizzes
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <Link href="/teacher/quizzes/create">Create Quiz</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col overflow-hidden rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm transition-colors hover:border-zinc-700">
          <CardHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-text">
                Students
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/students" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
            </div>
            <CardDescription className="text-thintext">
              Quick overview of your students
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            <div className="flex-shrink-0 space-y-4 px-6 pb-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-zinc-700 bg-bground3 text-text placeholder:text-thintext"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger className="border-zinc-700 bg-bground3 text-text">
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
              </div>
            </div>

            <div className="scrollbar flex-1 overflow-y-auto px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700 hover:bg-bground3">
                    <TableHead className="text-text">Name</TableHead>
                    <TableHead className="text-text">Email</TableHead>
                    <TableHead className="text-text">Class</TableHead>
                    <TableHead className="text-right text-text">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.slice(0, 20).map((student: Student) => (
                      <TableRow
                        key={student.id}
                        className="border-zinc-700 hover:bg-bground3"
                      >
                        <TableCell className="font-medium text-text">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-thintext">
                          {student.email}
                        </TableCell>
                        <TableCell className="text-thintext">
                          {taughtClasses.find((cls: any) =>
                            cls.students?.some(
                              (s: Student) => s.id === student.id,
                            ),
                          )?.name || ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewStudentProfile(student.id)}
                            className="border-zinc-700 text-text hover:bg-bground3"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-thintext"
                      >
                        {searchQuery
                          ? "No students found matching your search"
                          : "No students found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
