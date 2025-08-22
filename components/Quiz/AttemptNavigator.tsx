"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle2, HelpCircle } from "lucide-react";

type AttemptNavigatorProps = {
  questions: { id: string }[];
  currentIndex: number;
  answers: Record<string, number | null>;
  onNavigate: (index: number) => void;
  onSubmitClick: () => void;
};

export default function AttemptNavigator({
  questions,
  currentIndex,
  answers,
  onNavigate,
  onSubmitClick,
}: AttemptNavigatorProps) {
  return (
    <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Question Navigator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              variant={index === currentIndex ? "default" : "outline"}
              className={`h-10 w-10 p-0 ${
                answers[q.id] !== undefined
                  ? "border-green-500 text-green-800 bg-greenBg hover:bg-greenBg/80"
                  : ""
              }`}
              onClick={() => onNavigate(index)}
            >
              <span className="sr-only">Question {index + 1}</span>
              <span>{index + 1}</span>
            </Button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-4 w-4" />
            <span>answered</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>unanswered</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onSubmitClick} size="sm" className="w-full">
          Submit Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
