"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Trophy, User } from "lucide-react";

type UserLite = { id?: string; name?: string } | null | undefined;

export type LeaderboardRow = {
  id?: string;
  user?: UserLite;
  userId?: string;
  name?: string;
  score: number;
  completionTime?: string;
  formattedTime?: string;
  completedAt?: string;
};

type LeaderboardTableProps = {
  rows: LeaderboardRow[];
  currentUserId?: string | null;
  totalQuestions: number;
};

export default function LeaderboardTable({
  rows,
  currentUserId,
  totalQuestions,
}: LeaderboardTableProps) {
  const getAwardIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };

  const isCurrentUser = (userId: string | undefined): boolean => {
    if (!userId || !currentUserId) return false;
    return userId === currentUserId;
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
      <Table className="text-base">
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Rank</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Completion Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map((entry, index) => (
              <TableRow
                key={entry.id || index}
                className={
                  isCurrentUser(entry.user?.id || entry.userId)
                    ? "bg-muted/50"
                    : ""
                }
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getAwardIcon(index + 1)}
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {entry.user ? entry.user.name : entry.name || "Unknown"}
                    </span>
                    {isCurrentUser(entry.user?.id || entry.userId) ? (
                      <Badge
                        variant="outline"
                        className="ml-2 h-5 pt-1 text-xs"
                      >
                        You
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="pr-4 text-right font-bold">
                  {entry.score}
                </TableCell>
                <TableCell className="text-right">
                  {entry.completionTime || entry.formattedTime || "N/A"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No participants yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
