import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Checkbox } from "./ui/checkbox";
import { Loader2 } from "lucide-react";
import Confetti from "react-confetti";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizMe: React.FC<{ extractedText: string }> = ({ extractedText }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY as string,
  );

  useEffect(() => {
    generateQuiz();
  }, [extractedText]);

  const generateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setScore(null);
    setUserAnswers([]);
    setQuestions([]);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });
      const prompt = `Based on the following extracted text, generate 5 multiple-choice questions (MCQs) for a quiz. Each question should have 4 options, with only one correct answer. Format the output as a valid JSON array of objects, like this:

      [
        {
          "question": "Question text here",
          "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          "correctAnswer": 0
        },
        // ... (4 more questions in the same format)
      ]

      The 'correctAnswer' field should be the index (0-3) of the correct option.

      Extracted text:
      ${extractedText}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const generatedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(generatedQuestions);
      } else {
        throw new Error("Unable to extract valid JSON from the response");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
    if (showAnswers) {
      setShowAnswers(false);
      setScore(null);
      setAllCorrect(false);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowAnswers(true);
    setAllCorrect(correctAnswers === questions.length);

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const getOptionClassName = (qIndex: number, oIndex: number) => {
    if (!showAnswers) return "bg-transparent";
    if (oIndex === questions[qIndex].correctAnswer) {
      return "bg-green";
    }
    if (
      userAnswers[qIndex] === oIndex &&
      oIndex !== questions[qIndex].correctAnswer
    ) {
      return "bg-red";
    }
    return "bg-transparent";
  };

  return (
    <div className="scrollbar mr-2 space-y-6 rounded-lg bg-bground3 p-4 text-gray-200">
      {isLoading ? (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="text-orange-400 h-12 w-12 animate-spin" />
          <p className="text-lg font-medium">Generating quiz...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-redBg p-4 text-red">
          <p>{error}</p>
          <Button
            onClick={generateQuiz}
            className="mt-4 bg-orange hover:bg-orange/80"
          >
            Try Again
          </Button>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-8">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="rounded-lg bg-bground2 p-4 shadow">
              <p className="mb-4 text-lg font-semibold">{question.question}</p>
              <div className="space-y-3">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors ${getOptionClassName(qIndex, oIndex)}`}
                  >
                    <Checkbox
                      checked={userAnswers[qIndex] === oIndex}
                      onCheckedChange={() => handleAnswerChange(qIndex, oIndex)}
                      className="bg-orange-500 border-orange text-orange"
                    />
                    <span className="text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button
              className="bg-orange font-medium text-white hover:bg-orange"
              onClick={calculateScore}
            >
              {showAnswers ? "Recalculate Score" : "Submit Answers"}
            </Button>

            <Button
              className="bg-bground2 font-medium text-white hover:bg-zinc-900"
              onClick={() => {
                setShowAnswers(false);
                setUserAnswers([]);
                generateQuiz();
              }}
            >
              Generate New Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg">No quiz generated yet.</p>
        </div>
      )}
      {score !== null && (
        <div ref={resultsRef} className="mt-6 rounded-lg bg-bground2 p-4">
          <p className="text-lg font-bold">
            Your Score: {score} / {questions.length}
          </p>
        </div>
      )}
      {allCorrect && <Confetti />}
    </div>
  );
};

export default QuizMe;
