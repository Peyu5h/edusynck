"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, subDays } from "date-fns";
import {
  Activity,
  Edit2,
  Save,
  X,
  Loader2,
  ArrowLeft,
  Flame,
  Trophy,
  Calendar,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import {
  LeaderboardTableLoader,
  QuizLeaderboardLoader,
  QuizResultsLoader,
  RecommendationsLoader,
  ResultsPerformanceLoader,
  SubjectCardLoader,
} from "~/components/Loaders";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
    classNumber: string;
  };
  taughtClasses?: any[];
  streak?: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    activityLog: UserActivity[];
  };
}

interface UserActivity {
  date: string;
  count: number;
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = useSelector((state: any) => state.user.user);
  const isCurrentUser = currentUser?.id === userId;
  const canEdit =
    isCurrentUser ||
    currentUser?.role === "CLASS_TEACHER" ||
    currentUser?.role === "ADMIN";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/user/${userId}`);

        if (response.data.success) {
          setUser(response.data.data);
          setEditedName(response.data.data.name);
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
  }, [userId]);

  const getActivityData = () => {
    if (!user?.streak?.activityLog) return [];

    return user.streak.activityLog.map((activity) => ({
      date: activity.date,
      count: activity.count,
    }));
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString();
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(`/api/user/${userId}`, {
        name: editedName.trim(),
      });

      if (response.data.success) {
        setUser((prev) => (prev ? { ...prev, name: editedName.trim() } : null));
        setIsEditing(false);
        toast.success("Name updated successfully");
      } else {
        toast.error("Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("An error occurred while updating name");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || "");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center">
        <QuizLeaderboardLoader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground">
          {error || "The requested user could not be found."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex items-center gap-4 border-b bg-card px-6 py-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)] items-center justify-center gap-6 p-6">
        {/* Left Column - User Info */}
        <div className="flex w-2/3 flex-col gap-6">
          {/* User Information Card */}
          <div className="flex gap-6">
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="h-auto p-1 text-2xl font-bold"
                            />
                            <Button
                              onClick={handleSaveName}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Save className="h-5 w-5" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="text-sm">
                        {user.role.replace("_", " ")}
                      </Badge>
                      {user.class && (
                        <Badge variant="outline" className="text-sm">
                          Class {user.class.classNumber}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Email Address
                        </h4>
                        <p className="mt-1 text-base">{user.email}</p>
                      </div>
                      <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Role
                        </h4>
                        <p className="mt-1 text-base">
                          {user.role.replace("_", " ")}
                        </p>
                      </div>
                      {user.class && (
                        <>
                          <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Class
                            </h4>
                            <p className="mt-1 text-base">{user.class.name}</p>
                          </div>
                          <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Class Number
                            </h4>
                            <p className="mt-1 text-base">
                              {user.class.classNumber}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Stats */}
            <div className="w-1/3 space-y-12">
              {/* Streak Stats */}
              <Card className="pb-4">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="text-orange-500 h-5 w-5" />
                    Learning Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Current Streak
                      </h4>
                      <p className="mt-1 text-base">
                        {user.streak?.currentStreak || 0} days
                      </p>
                    </div>
                    <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Best Streak
                      </h4>
                      <p className="mt-1 text-base">
                        {user?.streak?.longestStreak || 0} days
                      </p>
                    </div>
                    {user.class && (
                      <>
                        <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Last Active
                          </h4>
                          <p className="mt-1 text-base">
                            {user?.streak?.lastActiveDate
                              ? new Date(
                                  user.streak.lastActiveDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border-2 border-bground3 p-2 px-4">
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Total Activities
                          </h4>
                          <p className="mt-1 text-base">
                            {user.streak?.activityLog?.length || 0} days
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity Heatmap */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Activity map
              </CardTitle>
              <CardDescription>
                Your learning activity over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="activity-heatmap">
                <style jsx global>{`
                  .react-calendar-heatmap .color-empty {
                    fill: hsl(var(--background));
                  }
                  .react-calendar-heatmap .color-scale-1 {
                    fill: hsl(var(--primary) / 0.3);
                  }
                  .react-calendar-heatmap .color-scale-2 {
                    fill: hsl(var(--primary) / 0.5);
                  }
                  .react-calendar-heatmap .color-scale-3 {
                    fill: hsl(var(--primary) / 0.7);
                  }
                  .react-calendar-heatmap .color-scale-4 {
                    fill: hsl(var(--primary));
                  }
                  .react-calendar-heatmap text {
                    fill: hsl(var(--muted-foreground));
                    font-size: 10px;
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
