"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Loader2,
  Flame,
  Calendar,
  Trophy,
  BookOpen,
  BarChart2,
  PieChart,
  AlertTriangle,
  Check,
  TrendingUp,
  Target,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  format,
  subDays,
  startOfYear,
  endOfYear,
  parseISO,
  subMonths,
  eachDayOfInterval,
  addDays,
} from "date-fns";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";

interface UserActivity {
  date: string;
  count: number;
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activityLog: UserActivity[];
}

interface WrongAnswer {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  materialName: string;
  courseName?: string;
  courseId?: string;
  timestamp: string;
}

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

interface Class {
  id: string;
  name: string;
  classNumber: string;
  courses?: Course[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
  class?: Class;
  courses?: Course[];
  taughtClasses?: Class[];
  wrongAnswers?: WrongAnswer[];
  streak?: UserStreak;
}

// Define types for chart data
interface ProgressDataPoint {
  month: string;
  accuracy: number;
}

interface SubjectProgress {
  name: string;
  startScore: number;
  currentScore: number;
  target: number;
}

interface ActivityDataPoint {
  day: string;
  quizzes: number;
  exercises: number;
  studyTime: number;
}

interface ChartEntry {
  name: string;
  value: number;
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // For analytics charts with proper typing
  const [courseStats, setCourseStats] = useState<ChartEntry[]>([]);
  const [topicStats, setTopicStats] = useState<ChartEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [progressBySubject, setProgressBySubject] = useState<SubjectProgress[]>(
    [],
  );
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityDataPoint[]>([]);
  const [completionRate, setCompletionRate] = useState<number>(0);

  const currentUser = useSelector((state: any) => state.user.user);
  const isCurrentUser = currentUser?.id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`,
        );

        console.log("User data response:", response.data);
        if (response.data.success) {
          setUser(response.data.data);

          if (
            response.data.data.wrongAnswers &&
            response.data.data.wrongAnswers.length > 0
          ) {
            setWrongAnswers(response.data.data.wrongAnswers);
            processWrongAnswersStats(response.data.data.wrongAnswers);
          }
          else if (
            isCurrentUser ||
            currentUser?.role === "CLASS_TEACHER" ||
            currentUser?.role === "ADMIN"
          ) {
            try {
              const analyticsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/wrong-answers/${userId}`,
              );

              if (analyticsResponse.data.success) {
                setWrongAnswers(analyticsResponse.data.data);
                processWrongAnswersStats(analyticsResponse.data.data);
              }
            } catch (analyticsError) {
              console.error("Error fetching analytics data:", analyticsError);
            }
          }

          generateMockProgressData();
        } else {
          setError(response.data.message || "Failed to fetch user");
        }
      } catch (err) {
        setError("An error occurred while fetching user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, isCurrentUser, currentUser?.role]);

  const processWrongAnswersStats = (wrongAns: WrongAnswer[]) => {
    const courseCounts: Record<string, number> = {};
    const topicCounts: Record<string, number> = {};

    if (!wrongAns || wrongAns.length === 0) {
      const sampleCourses = [
        "Mathematics",
        "Physics",
        "Computer Science",
        "Biology",
        "Chemistry",
      ];
      const sampleTopics = [
        "Calculus",
        "Algebra",
        "Mechanics",
        "Programming",
        "Genetics",
      ];

      sampleCourses.forEach((course) => {
        courseCounts[course] = Math.floor(Math.random() * 10) + 1;
      });

      sampleTopics.forEach((topic) => {
        topicCounts[topic] = Math.floor(Math.random() * 8) + 1;
      });
    } else {
      wrongAns.forEach((answer) => {
        const courseName = answer.courseName || "Unknown";
        const topicName = answer.materialName || "Unknown";

        if (courseCounts[courseName]) {
          courseCounts[courseName]++;
        } else {
          courseCounts[courseName] = 1;
        }

        if (topicCounts[topicName]) {
          topicCounts[topicName]++;
        } else {
          topicCounts[topicName] = 1;
        }
      });
    }

    const courseData = Object.keys(courseCounts).map((course) => ({
      name: course,
      value: courseCounts[course],
    }));

    const topicData = Object.keys(topicCounts).map((topic) => ({
      name: topic,
      value: topicCounts[topic],
    }));

    setCourseStats(courseData);
    setTopicStats(topicData);
  };

  const generateMockProgressData = () => {
    const progressOverTime = [];
    const subjects = ["Mathematics", "Physics", "Computer Science", "Biology"];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const month = format(date, "MMM");

      const baseAccuracy = 65 + (5 - i) * 5 + (Math.random() * 6 - 3);

      progressOverTime.push({
        month,
        accuracy: Math.min(Math.max(Math.round(baseAccuracy), 60), 95),
      });
    }

    const subjectProgress = subjects.map((subject) => {
      const startValue = 50 + Math.floor(Math.random() * 20);
      const improvement = 5 + Math.floor(Math.random() * 15);

      return {
        name: subject,
        startScore: startValue,
        currentScore: Math.min(startValue + improvement, 98),
        target: 100,
      };
    });

    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      weekDays.push({
        day: format(date, "EEE"),
        quizzes: Math.floor(Math.random() * 3),
        exercises: Math.floor(Math.random() * 5),
        studyTime: Math.floor(Math.random() * 120) + 30, // Minutes
      });
    }

    const rate = Math.floor(Math.random() * 20) + 20;

    setProgressData(progressOverTime);
    setProgressBySubject(subjectProgress);
    setWeeklyActivity(weekDays);
    setCompletionRate(rate);
  };

  const getActivityData = () => {
    if (!user?.streak?.activityLog) return [];

    return user.streak.activityLog.map((activity) => ({
      date: activity.date,
      count: activity.count,
    }));
  };

  const formatDate = (date: string): string => {
    return format(new Date(date), "MMM do, yyyy");
  };

  const COLORS = [
    "#4f46e5",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];
  const ACTIVITY_COLORS = {
    quizzes: "#4f46e5",
    exercises: "#10b981",
    studyTime: "#f59e0b",
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground">
          The requested user could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
        
            <TabsTrigger value="analytics">Learning Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 pb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge className="mt-2">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {user.class && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">
                        Class
                      </h4>
                      <p className="font-semibold">
                        {user.class.name} ({user.class.classNumber})
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <Flame className="text-orange-500 mr-2 h-5 w-5" />
                  Activity Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Current Streak
                      </span>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold">
                          {user.streak?.currentStreak || 0}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          days
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Longest Streak
                      </span>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold">
                          {user.streak?.longestStreak || 0}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Last active
                    </span>
                    <p className="font-medium">
                      {user.streak?.lastActiveDate
                        ? format(
                            new Date(user.streak.lastActiveDate),
                            "MMM d, yyyy",
                          )
                        : "Never"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full rounded-md bg-muted p-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex space-x-1">
                      <div className="h-3 w-3 rounded-sm bg-muted-foreground/20"></div>
                      <div className="h-3 w-3 rounded-sm bg-primary/30"></div>
                      <div className="h-3 w-3 rounded-sm bg-primary/60"></div>
                      <div className="h-3 w-3 rounded-sm bg-primary"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="mt-6 rounded-lg border bg-zinc-900/50 p-8">
            <div className="activity-heatmap">
              <style jsx global>{`
                      .react-calendar-heatmap .color-empty {
                        fill: var(--muted);
                      }
                      .react-calendar-heatmap .color-scale-1 {
                        fill: rgba(var(--primary-rgb), 0.3);
                      }
                      .react-calendar-heatmap .color-scale-2 {2043246
                        fill: rgba(var(--primary-rgb), 0.5);
                      }
                      .react-calendar-heatmap .color-scale-3 {
                        fill: rgba(var(--primary-rgb), 0.7);
                      }
                      .react-calendar-heatmap .color-scale-4 {
                        fill: rgba(var(--primary-rgb), 1);
                      }
                    `}</style>
              <ReactCalendarHeatmap
                startDate={subDays(new Date(), 365)}
                endDate={new Date()}
                values={getActivityData()}
                showWeekdayLabels={true}
                titleForValue={(value) =>
                  value
                    ? `${formatDate(value.date)}: ${value.count} activities`
                    : "No activity"
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          {/* ... existing activity tab content ... */}
        </TabsContent>

        {(isCurrentUser ||
          currentUser?.role === "CLASS_TEACHER" ||
          currentUser?.role === "ADMIN") && (
          <TabsContent value="analytics">
            {/* Progress Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Learning Progress Overview
                </CardTitle>
                <CardDescription>
                  Track your improvement over time across all subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Accuracy Over Time Chart */}
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-4 text-lg font-medium">
                      Quiz Accuracy Trend
                    </h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={progressData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient
                              id="accuracyGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--primary)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--primary)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[50, 100]}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                            }}
                            formatter={(
                              value: number,
                              name: string,
                              props: any,
                            ) => [`${value}%`, "Accuracy"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="accuracy"
                            stroke="var(--primary)"
                            fill="url(#accuracyGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      Your quiz accuracy has improved by approximately{" "}
                      {progressData.length > 0
                        ? progressData[progressData.length - 1].accuracy -
                          progressData[0].accuracy
                        : 0}
                      % over the last 6 months
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Course Completion Rate
                      </h3>
                      <div className="flex items-center text-sm">
                        <span
                          className={
                            completionRate >= 80
                              ? "text-green-500"
                              : "text-amber-500"
                          }
                        >
                          {completionRate}%
                        </span>
                        <ArrowUpRight className="text-green-500 ml-1 h-4 w-4" />
                      </div>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

        
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" /> Weekly Activity
                  </CardTitle>
                  <CardDescription>
                    Your learning activities over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weeklyActivity}
                        margin={{ top: 20, right: 5, left: 0, bottom: 20 }}
                        barGap={0}
                        barSize={15}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            fontSize: "12px",
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={40}
                          iconType="circle"
                          iconSize={8}
                        />
                        <Bar
                          name="Quizzes"
                          dataKey="quizzes"
                          fill={ACTIVITY_COLORS.quizzes}
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          name="Exercises"
                          dataKey="exercises"
                          fill={ACTIVITY_COLORS.exercises}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Course Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" /> Course Performance
                  </CardTitle>
                  <CardDescription>
                    Areas that need more attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={courseStats}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          label={(entry: ChartEntry) => entry.name}
                          labelLine={{
                            stroke: "var(--foreground)",
                            strokeWidth: 0.5,
                          }}
                        >
                          {courseStats.map(
                            (entry: ChartEntry, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                strokeWidth={1}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [
                            `${value} questions`,
                            "Mistakes",
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            fontSize: "12px",
                          }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Topic Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" /> Topic Breakdown
                  </CardTitle>
                  <CardDescription>
                    Analyze which topics need more attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={topicStats}
                        margin={{ top: 5, right: 5, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          width={80}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [`${value} mistakes`, "Count"]}
                        />
                        <Bar
                          dataKey="value"
                          fill="var(--primary)"
                          radius={[0, 4, 4, 0]}
                          barSize={16}
                        >
                          {topicStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Wrong Answers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" /> Recent Mistakes
                  </CardTitle>
                  <CardDescription>
                    Review your recent mistakes to improve
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="scrollbar max-h-80 space-y-4 overflow-y-auto pr-2">
                    {wrongAnswers.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No wrong answers recorded yet
                        </p>
                      </div>
                    ) : (
                      wrongAnswers.slice(0, 3).map((answer) => (
                        <div key={answer.id} className="rounded-lg border p-4">
                          <div className="flex justify-between">
                            <h4 className="font-semibold">
                              {answer.materialName}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(answer.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium">
                            {answer.question}
                          </p>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <div className="rounded-md bg-destructive/10 p-2">
                              <p className="text-xs font-medium text-destructive">
                                {answer.userAnswer}
                              </p>
                            </div>
                            <div className="rounded-md bg-primary/10 p-2">
                              <p className="text-xs font-medium text-primary">
                                {answer.correctAnswer}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {wrongAnswers.length > 3 && (
                      <Button
                        variant="outline"
                        className="mt-2 w-full"
                        size="sm"
                        onClick={() => {
                          // Create modal or expand
                        }}
                      >
                        View All {wrongAnswers.length} Mistakes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
