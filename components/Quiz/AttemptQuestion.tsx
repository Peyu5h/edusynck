"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type AttemptQuestionProps = {
  question: {
    id: string;
    question: string;
    options: string[];
    points: number;
  };
  questionIndex: number;
  totalQuestions: number;
  selectedOption: number | null | undefined;
  onSelect: (optionIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
};

export default function AttemptQuestion({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelect,
  onPrev,
  onNext,
  onFinish,
}: AttemptQuestionProps) {
  return (
    <Card className="mb-6 overflow-hidden rounded-xl border bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className="bg-primary/10 text-primary">
            Question {questionIndex + 1} of {totalQuestions}
          </Badge>
          <Badge variant="outline">
            {question.points} {question.points === 1 ? "point" : "points"}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.options.map((option, oIndex) => (
          <div
            key={oIndex}
            className={`flex cursor-pointer items-start space-x-3 rounded-md border p-3 transition-colors ${
              selectedOption === oIndex
                ? "border-primary bg-primary/5"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelect(oIndex)}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                selectedOption === oIndex
                  ? "border-primary bg-primary text-white"
                  : "border-muted-foreground/20"
              }`}
            >
              {String.fromCharCode(65 + oIndex)}
            </div>
            <div className="flex-1">
              <p>{option}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={questionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {questionIndex < totalQuestions - 1 ? (
          <Button size="sm" onClick={onNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={onFinish}>
            Finish Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
