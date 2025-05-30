"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import DocViewer, {
  DocViewerRenderers,
  IDocument,
} from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { ArrowUpRight, Check, Copy, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import Textarea from "react-textarea-autosize";

import pdfToText from "react-pdftotext";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "./ui/button";
import MarkdownRenderer from "./MarkdownRender";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import YouTubeVideos from "./YouTubeVideos";
import QuizMe from "./QuizMe";
import { ny } from "~/lib/utils";
import { HiSparkles } from "react-icons/hi2";
import { BsStars } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { Message } from "~/lib/types";
import EmptyScreen, { ChatItem } from "./ChatScreen";
import { useToast } from "./ui/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const LoadingRenderer: React.FC<{
  document: IDocument | undefined;
  fileName: string;
}> = ({ document, fileName }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 size="2rem" className="animate-spin" />
    </div>
  );
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const MaterialView: React.FC<{
  uri: string;
  fileType: string;
  materialName?: string;
  courseId?: string;
}> = ({
  uri,
  fileType,
  materialName,
  courseId,
}: {
  uri: string;
  fileType: string;
  materialName?: string;
  courseId?: string;
}) => {
  const [doc, setDoc] = useState<IDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatPrompt, setChatPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showDocument, setShowDocument] = useState(true);

  const extractText = useCallback(async (url: string, type: string) => {
    setIsExtracting(true);
    try {
      let text = "";
      switch (type.toLowerCase()) {
        case "pdf":
          text = await extractTextFromPDF(url);
          break;
        case "docx":
          text = await extractTextFromDOCX(url);
          break;
        case "pptx":
        case "ppt":
          text = await extractTextFromPptx(url);
          break;
        case "jpeg":
        case "jpg":
        case "png":
          text = await extractTextFromImage(url);
          break;
        default:
          text = "Unsupported file type";
      }
      setExtractedText(text);
    } catch (error) {
      console.error("Error extracting text:", error);
      setExtractedText("Failed to extract text from the document.");
    }
    setIsExtracting(false);
  }, []);

  useEffect(() => {
    if (uri && fileType) {
      const newDoc: IDocument[] = [
        {
          uri: uri,
          fileType: fileType,
          fileName: `test.${fileType}`,
        },
      ];
      setDoc(newDoc);
      setSelectedDoc(newDoc[0]);

      // Start text extraction immediately
      extractText(uri, fileType);
    }
  }, [uri, fileType, extractText]);

  console.log(fileType);

  const extractTextFromPDF = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "document.pdf", { type: blob.type });

      try {
        const text = await pdfToText(file);
        return text;
      } catch (textError) {
        console.error(
          "Text extraction failed, falling back to OCR:",
          textError,
        );
        return await performOcr(blob);
      }
    } catch (error) {
      console.error("Error during PDF text extraction:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const performOcr = async (blob: Blob): Promise<string> => {
    try {
      const typedArray = new Uint8Array(await blob.arrayBuffer());
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      const extractedText: string[] = [];
      const numPages = pdf.numPages;
      const pagePromises = [];

      for (let i = 1; i <= numPages; i++) {
        pagePromises.push(
          pdf.getPage(i).then(async (page: any) => {
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;

            const imageData = canvas.toDataURL("image/png");
            const { data } = await Tesseract.recognize(imageData, "eng");
            extractedText.push(data.text);
          }),
        );
      }

      await Promise.all(pagePromises);
      return extractedText.join("\n\n");
    } catch (error) {
      console.error("OCR extraction failed:", error);
      throw new Error("OCR failed to extract text");
    }
  };

  const extractTextFromDOCX = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromPptx = async (url: string): Promise<string> => {
    try {
      const response = await fetch(
        `${backendUrl}/api/admin/convert2PDF?url=${url}`,
      );
      const data = await response.json();
      return data.text;
    } catch (error) {
      return "";
    }
  };

  const extractTextFromImage = async (url: string): Promise<string> => {
    try {
      const response = await fetch(
        `${backendUrl}/api/admin/image?thumbnailUrl=${url}`,
      );
      const blob = await response.blob();
      const imageData = URL.createObjectURL(blob);
      const { data } = await Tesseract.recognize(imageData, "eng");
      return data.text;
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw new Error("Failed to extract text from image");
    }
  };

  useEffect(() => {
    if (extractedText) {
      const extractKeywords = (text: string) => {
        const words = text.toLowerCase().split(/\W+/);
        const stopWords = new Set([
          "the",
          "a",
          "an",
          "in",
          "on",
          "at",
          "for",
          "to",
          "of",
          "and",
          "or",
          "but",
        ]);
        const wordFreq = words.reduce(
          (acc, word) => {
            if (!stopWords.has(word) && word.length > 2) {
              acc[word] = (acc[word] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>,
        );

        const sortedWords = Object.entries(wordFreq).sort(
          (a, b) => b[1] - a[1],
        );
        const topKeywords = sortedWords.slice(0, 4).map(([word]) => word);
        return [...topKeywords, "MU sem exam"];
      };

      setKeywords(extractKeywords(extractedText));
    }
  }, [extractedText]);

  const { toast } = useToast();

  // ai stuff
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const genAI = useRef(
    new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY as string),
  );

  const generatePrompt = useCallback(() => {
    return `Based on the following text, create detailed study notes suitable for university exam preparation, focusing on Mumbai University:
  
  ${extractedText}
  
  Please include:
  1. Key topics and concepts, highlighting those frequently asked in previous year questions
  2. Important definitions and explanations
  3. Summarized points for easy understanding and quick revision
  4. Any formulas, theories, or methodologies that are crucial for the exam
  5. Brief examples or case studies, if applicable
  
  Format the notes in a clear, structured manner using Markdown for better readability.`;
  }, [extractedText]);

  const generateResponse = useCallback(async () => {
    const prompt = generatePrompt();
    if (!prompt) {
      setError("No text to summarize.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const model = genAI.current.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });
      const result = await model.generateContentStream(prompt);
      let fullResponse = "";
      for await (const chunk of result.stream) {
        fullResponse += chunk.text();
        setResponse(fullResponse);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setError(
        "An error occurred while generating the response. Please try again later.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [generatePrompt]);

  const generateSearchString = useCallback(async () => {
    if (!extractedText) {
      setError("No text to analyze.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const model = genAI.current.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });
      const prompt = `Analyze the following text and generate a concise search string (max 5-6 words) that captures the main topic for searching related YouTube videos:

${extractedText}

Search string:`;

      const result = await model.generateContent(prompt);
      const generatedSearchString = result.response.text().trim();
      setSearchString(generatedSearchString);
    } catch (error) {
      console.error("Error generating search string:", error);
      setError(
        "An error occurred while generating the search string. Please try again later.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [extractedText]);

  useEffect(() => {
    if (extractedText) {
      generateSearchString();
    }
  }, [extractedText, generateSearchString]);

  const handleGenerate = () => {
    setResponse("");
    generateResponse();
  };

  const generateChatResponse = useCallback(async () => {
    if (!chatPrompt.trim()) return;

    setIsGenerating(true);
    const newMessage: Message = { role: "user", content: chatPrompt };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatPrompt("");

    try {
      const model = genAI.current.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessageStream(
        `Based on the following extracted text, please answer the user's question: "${chatPrompt}"\n\nExtracted text:\n${extractedText}`,
      );

      let fullResponse = "";
      const responseMessageId = Date.now();

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: responseMessageId },
      ]);

      for await (const chunk of result.stream) {
        fullResponse += chunk.text();
        setChatMessages((prev) =>
          prev.map((msg) =>
            "id" in msg && msg.id === responseMessageId
              ? { ...msg, content: fullResponse }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error generating chat response:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred. Please try again.",
          id: Date.now(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [chatPrompt, extractedText]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const examNotesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (examNotesRef.current) {
      examNotesRef.current.scrollTop = examNotesRef.current.scrollHeight;
    }
  }, [response]);

  const [copyNotes, setCopyNotes] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(response)
      .then(() => {
        setCopyNotes(true);
        setTimeout(() => setCopyNotes(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // New component for displaying PYQs
  const PreviousYearQuestions: React.FC<{
    extractedText: string;
    courseId?: string;
  }> = ({ extractedText, courseId }) => {
    const [pyqData, setPyqData] = useState<string[]>([]);
    const [relevantPyq, setRelevantPyq] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const genAI = useRef(
      new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY as string,
      ),
    );

    // Fetch PYQ data
    useEffect(() => {
      const fetchPyqData = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/pyq`);
          if (!response.ok) {
            throw new Error("Failed to fetch PYQ data");
          }
          const data = await response.text();
          const questions = data
            .split("\n\n")
            .filter((q) => q.trim().length > 0);
          setPyqData(questions);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching PYQ data:", error);
          toast({
            title: "Error",
            description: "Failed to load previous year questions",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      };

      fetchPyqData();
    }, [toast]);

    // Find relevant PYQs based on document content
    useEffect(() => {
      const findRelevantQuestions = async () => {
        if (!extractedText || pyqData.length === 0) return;

        setIsLoading(true);
        try {
          const model = genAI.current.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
          });

          const prompt = `
I have a document with the following content:
${extractedText.substring(0, 2000)}...

And I have a list of previous year exam questions. Please identify the question numbers (1-indexed) from the list that are most relevant to the document content (return only up to 5 most relevant questions):

${pyqData.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return only the numbers of relevant questions, separated by commas (e.g., "1,4,7"):
`;

          const result = await model.generateContent(prompt);
          const relevantIndices = result.response
            .text()
            .split(",")
            .map((num) => parseInt(num.trim(), 10) - 1)
            .filter((num) => !isNaN(num) && num >= 0 && num < pyqData.length);

          setRelevantPyq(relevantIndices.map((i) => pyqData[i]));
        } catch (error) {
          console.error("Error finding relevant PYQs:", error);
          // If AI fails, show a random selection of questions
          const randomIndices = Array.from(
            { length: Math.min(5, pyqData.length) },
            () => Math.floor(Math.random() * pyqData.length),
          );
          setRelevantPyq(randomIndices.map((i) => pyqData[i]));
        } finally {
          setIsLoading(false);
        }
      };

      findRelevantQuestions();
    }, [extractedText, pyqData]);

    return (
      <div className="h-full overflow-y-auto p-4">
        <h2 className="mb-4 text-xl font-semibold">
          Related Previous Year Questions
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Finding relevant questions...</span>
          </div>
        ) : relevantPyq.length > 0 ? (
          <div className="space-y-4">
            {relevantPyq.map((question, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-bground2 p-4 shadow-sm"
              >
                <p className="text-foreground">{question}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <p>No relevant questions found. Try with a different document.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[76vh] w-full flex-col gap-y-4 overflow-y-hidden md:flex-row md:gap-x-4 md:gap-y-0">
      <div
        className={`scrollbar h-full overflow-x-auto md:w-1/3 ${showDocument ? "block" : "hidden sm:block"}`}
      >
        {doc ? (
          doc.length > 0 ? (
            <DocViewer
              prefetchMethod="GET"
              style={{ borderRadius: "10px", height: "100%" }}
              documents={doc}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: false,
                  retainURLParams: false,
                },
                loadingRenderer: {
                  overrideComponent: () => (
                    <div className="flex h-full w-full animate-pulse items-center justify-center bg-gray-100">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
                    </div>
                  ),
                },
              }}
              pluginRenderers={DocViewerRenderers}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-thintext" />
              </div>
            </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gray-100">
            <div className="mb-4 h-32 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <p className="text-gray-500">No document loaded</p>
          </div>
        )}
      </div>
      <div
        className={`h-full md:w-2/3 ${showDocument ? "hidden sm:block" : "block"}`}
      >
        <Tabs
          defaultValue="chat"
          className="flex h-full w-full flex-col p-4 pt-0"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="examNotes" disabled={!extractedText}>
              Make Notes
            </TabsTrigger>
            <TabsTrigger value="youtube" disabled={!extractedText}>
              YouTube
            </TabsTrigger>
            <TabsTrigger value="quizMe" disabled={!extractedText}>
              Quiz Me
            </TabsTrigger>
            <TabsTrigger value="pyq" disabled={!extractedText}>
              Previous Year Q
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-grow overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="scrollbar flex-grow overflow-y-auto"
              >
                {chatMessages.length === 0 ? (
                  <EmptyScreen
                    setChatPrompt={setChatPrompt}
                    isExtracting={isExtracting}
                  />
                ) : (
                  chatMessages.map((message, index) => (
                    <ChatItem key={index} message={message} />
                  ))
                )}
              </div>
              <div className="mt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    generateChatResponse();
                  }}
                >
                  <div className="scrollbar relative flex max-h-60 w-full grow flex-col overflow-hidden rounded-md border">
                    <Textarea
                      placeholder={
                        isExtracting
                          ? ""
                          : "Ask a question about the document..."
                      }
                      className="scrollbar min-h-[50px] w-full resize-none bg-background px-6 py-5 text-[12px] focus-within:outline-none"
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      disabled={isExtracting}
                    />
                    <Button
                      style={{ zIndex: 100 }}
                      type="submit"
                      className="absolute bottom-2 right-2 cursor-pointer rounded-md bg-bground3 text-white hover:bg-zinc-800 disabled:cursor-not-allowed"
                      disabled={
                        isGenerating || !chatPrompt.trim() || isExtracting
                      }
                    >
                      <ArrowUpRight className="text-white" size={16} />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="examNotes"
            className="scrollbar flex-grow overflow-hidden"
          >
            <div className="scrollbar flex h-full flex-col">
              <div className="relative flex-grow">
                <div
                  ref={examNotesRef}
                  className="scrollbar mb-4 h-[calc(100vh-300px)] flex-grow overflow-y-auto rounded bg-bground3 p-4 text-foreground"
                >
                  {response ? (
                    <MarkdownRenderer content={response} />
                  ) : (
                    <div className="mx-16 flex h-full items-center justify-center text-center text-lg text-thintext">
                      <p>
                        Click &quot;Generate Notes&quot; to create detailed
                        study notes based on the document content.
                      </p>
                    </div>
                  )}
                  {error && <p className="text-red-500">{error}</p>}
                </div>
                {response && (
                  <Button
                    className="absolute right-2 top-2 bg-bground2 p-2 px-3 text-white hover:bg-zinc-700"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    {copyNotes ? (
                      <Check className="text-white" size={16} />
                    ) : (
                      <Copy className="text-white" size={16} />
                    )}
                  </Button>
                )}
              </div>
              <Button
                className="mt-0 bg-bground3 font-medium text-white hover:bg-zinc-800"
                onClick={handleGenerate}
                disabled={isGenerating || !extractedText}
              >
                {isGenerating ? "Generating..." : "Generate Notes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="youtube"
            className="scrollbar flex-grow overflow-hidden"
          >
            <div className="scrollbar flex h-full flex-col">
              <h2 className="mb-4 text-xl font-bold">Related YouTube Videos</h2>
              <p className="mb-4 text-sm text-gray-600">
                Search string: {searchString}
              </p>
              <div className="scrollbar flex-grow overflow-y-auto">
                <YouTubeVideos keywords={[searchString]} />
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="quizMe"
            className="scrollbar flex-grow overflow-hidden"
          >
            <div className="scrollbar flex h-full flex-col">
              <div className="scrollbar flex-grow overflow-y-auto">
                <QuizMe
                  extractedText={extractedText}
                  materialName={materialName}
                  courseId={courseId}
                />
              </div>
            </div>
          </TabsContent>

          {/* New Tab for Previous Year Questions */}
          <TabsContent
            value="pyq"
            className="scrollbar flex-grow overflow-hidden"
          >
            <div className="scrollbar flex h-full flex-col">
              <div className="scrollbar flex-grow overflow-y-auto">
                <PreviousYearQuestions
                  extractedText={extractedText}
                  courseId={courseId}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="fixed bottom-4 right-4 sm:hidden">
        <Button
          onClick={() => setShowDocument(!showDocument)}
          className="bg-bground3 text-white hover:bg-zinc-800"
        >
          {showDocument ? "Show Tabs" : "Show Document"}
        </Button>
      </div>
    </div>
  );
};

export default MaterialView;
