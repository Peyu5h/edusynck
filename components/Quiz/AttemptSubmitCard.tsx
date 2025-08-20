"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

type AttemptSubmitCardProps = {
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function AttemptSubmitCard({
  answeredCount,
  totalQuestions,
  isSubmitting,
  onCancel,
  onSubmit,
}: AttemptSubmitCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-lg text-yellow-800">
            ready to submit?
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-yellow-700">
          you&apos;ve answered {answeredCount} of {totalQuestions} questions.
          {answeredCount < totalQuestions &&
            " some questions are still unanswered."}
        </p>
        <p className="mt-2 text-sm text-yellow-600">
          once submitted, you won&apos;t be able to change your answers.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Continue Quiz
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
