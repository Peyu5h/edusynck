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
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Users, BookOpen, BarChart, CalendarClock } from "lucide-react";

export default function TeacherDashboardPage() {
  const user = useSelector((state: any) => state.user.user);
  console.log(user);
  const taughtClasses = user?.taughtClasses || [];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Teacher Dashboard</h1>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Classes you are teaching</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taughtClasses.length}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Total students in your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {taughtClasses.reduce(
                  (acc: number, cls: any) => acc + (cls.students?.length || 0),
                  0,
                )}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/students" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Total courses you manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {taughtClasses.reduce(
                  (acc: number, cls: any) => acc + (cls.courses?.length || 0),
                  0,
                )}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/courses" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Active assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">0</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/assignments" className="flex items-center">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Recent Activity
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-muted-foreground">Today</p>
                <p>No activity recorded today</p>
              </div>
              <div className="border-l-4 border-muted pl-4">
                <p className="text-sm text-muted-foreground">Yesterday</p>
                <p>No activity recorded yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Upcoming Events
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No upcoming events scheduled
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Schedule Event
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
            <CardDescription>
              Student performance across your classes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <p className="text-center text-muted-foreground">
              Performance data will appear here once students start submitting
              assignments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
