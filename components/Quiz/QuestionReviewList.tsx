"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, XCircle, Award, AlertCircle } from "lucide-react";

type ReviewQuestion = {
  id: string;
  order: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
};

type ReviewAnswer = {
  id: string;
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean | null;
  question: ReviewQuestion;
};

type QuestionReviewListProps = {
  answers: ReviewAnswer[];
};

export default function QuestionReviewList({
  answers,
}: QuestionReviewListProps) {
  const sorted = [...answers].sort(
    (a, b) => a.question.order - b.question.order,
  );

  return (
    <div className="space-y-6">
      {sorted.map((answer) => (
        <Card
          key={answer.id}
          className={`overflow-hidden border-l-4 bg-bground2 shadow-sm`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">
                Question {answer.question.order + 1}
              </CardTitle>
              <Badge
                variant="outline"
                className={`flex items-center justify-center gap-1 py-1 text-sm font-medium`}
              >
                {answer.isCorrect ? (
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                ) : answer.selectedOption === null ? (
                  <AlertCircle className="mr-1 h-4 w-4" />
                ) : (
                  <XCircle className="mr-1 h-4 w-4" />
                )}
                <span className="pt-0.5">
                  {answer.isCorrect
                    ? "Correct"
                    : answer.selectedOption === null
                      ? "Unanswered"
                      : "Incorrect"}
                </span>
              </Badge>
            </div>
            <CardDescription className="mt-3 text-base font-medium text-foreground">
              {answer.question.question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {answer.question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                  answer.question.correctAnswer === index
                    ? "border-green/50 bg-greenBg dark:bg-greenBg"
                    : answer.selectedOption === index && !answer.isCorrect
                      ? "border-red/50 bg-redBg dark:bg-redBg"
                      : answer.selectedOption === index
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 dark:border-gray-400/20"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 pt-1 font-bold ${
                    answer.question.correctAnswer === index
                      ? "border-green/50 bg-greenBg text-white dark:border-green dark:bg-greenBg"
                      : answer.selectedOption === index && !answer.isCorrect
                        ? "border-red/50 bg-redBg text-white dark:border-red dark:bg-redBg"
                        : answer.selectedOption === index
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-gray-100 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">
                  <p className="p-1 text-sm font-medium text-foreground">
                    {option}
                  </p>
                </div>
                {answer.question.correctAnswer === index && (
                  <CheckCircle2 className="h-6 w-6 text-green" />
                )}
                {answer.selectedOption === index && !answer.isCorrect && (
                  <XCircle className="h-6 w-6 text-red" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
