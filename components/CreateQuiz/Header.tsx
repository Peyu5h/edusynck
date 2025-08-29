"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CreateQuizHeaderProps {
  title?: string;
}

const CreateQuizHeader: React.FC<CreateQuizHeaderProps> = ({
  title = "Create Quiz",
}) => {
  const router = useRouter();
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/teacher/quizzes")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizHeader;
