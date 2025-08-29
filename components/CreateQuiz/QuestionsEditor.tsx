"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuestionsEditorProps {
  questions: Question[];
  errors: any;
  getQuestionError: (index: number, field: string) => string;
  onChangeField: (path: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onOptionChange: (qIndex: number, oIndex: number, value: string) => void;
  onCorrectChange: (qIndex: number, oIndex: number) => void;
}

const QuestionsEditor: React.FC<QuestionsEditorProps> = ({
  questions,
  errors,
  getQuestionError,
  onChangeField,
  onAdd,
  onRemove,
  onOptionChange,
  onCorrectChange,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Questions</CardTitle>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {qIndex + 1}
                </span>
                Question {qIndex + 1}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(qIndex)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={q.question}
                onChange={(e) =>
                  onChangeField(`questions[${qIndex}].question`, e.target.value)
                }
                placeholder="Enter your question here"
                className="min-h-[80px]"
              />
              {getQuestionError(qIndex, "question") && (
                <div className="text-red-500 text-sm">
                  {getQuestionError(qIndex, "question")}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <Label>Options</Label>
                <div className="text-sm text-muted-foreground">
                  Select the correct answer
                </div>
              </div>
              <div className="grid gap-3">
                {q.options.map((opt, oIndex) => (
                  <div
                    key={oIndex}
                    className={`flex items-center gap-3 rounded-md border p-3 transition-colors ${q.correctAnswer === oIndex ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                  >
                    <div className="flex-shrink-0">
                      <Checkbox
                        id={`q-${qIndex}-o-${oIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onCheckedChange={() => onCorrectChange(qIndex, oIndex)}
                      />
                    </div>
                    <div className="flex-grow">
                      <Input
                        value={opt}
                        onChange={(e) =>
                          onOptionChange(qIndex, oIndex, e.target.value)
                        }
                        placeholder={`Option ${oIndex + 1}`}
                        className={`border-none bg-transparent p-0 shadow-none focus-visible:ring-0 ${q.correctAnswer === oIndex ? "font-medium" : ""}`}
                      />
                    </div>
                  </div>
                ))}
                {getQuestionError(qIndex, "options") && (
                  <div className="text-red-500 text-sm">
                    {getQuestionError(qIndex, "options")}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor={`points-${qIndex}`}>Points</Label>
              <Input
                id={`points-${qIndex}`}
                type="number"
                value={q.points}
                onChange={(e) =>
                  onChangeField(
                    `questions[${qIndex}].points`,
                    Number(e.target.value),
                  )
                }
                min="1"
                className="mt-1 w-24"
              />
            </div>
          </div>
        ))}

        {typeof errors?.questions === "string" && (
          <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errors.questions}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className="mt-2 w-full border-dashed py-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Another Question
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuestionsEditor;
