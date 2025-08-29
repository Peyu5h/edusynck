"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import type { Question } from "~/components/CreateQuiz/QuestionsEditor";

interface AiAssistPanelProps {
  value: string;
  onChange: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedQuestions: Question[];
}

const AiAssistPanel: React.FC<AiAssistPanelProps> = ({
  value,
  onChange,
  onGenerate,
  isGenerating,
  generatedQuestions,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border bg-bground3 p-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            AI will draft multiple-choice questions which you can edit before
            creating the quiz.
          </p>
        </div>

        <div>
          <Label htmlFor="contentForAi">Content for AI Generation</Label>
          <Textarea
            id="contentForAi"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter the content or topic for which you want to generate quiz questions..."
            rows={8}
            className=""
          />
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
              Questions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Questions with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AiAssistPanel;
