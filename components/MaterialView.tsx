"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import DocViewer, {
  DocViewerRenderers,
  IDocument,
} from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";

import pdfToText from "react-pdftotext";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "./ui/button";
import MarkdownRenderer from "./MarkdownRender";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import YouTubeVideos from "./YouTubeVideos";

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
}> = ({ uri, fileType }: { uri: string; fileType: string }) => {
  const [doc, setDoc] = useState<IDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [searchString, setSearchString] = useState<string>("");

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
    }
  }, [uri, fileType]);

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
    const extractText = async () => {
      if (!selectedDoc || !selectedDoc.fileType) {
        return;
      }

      setIsExtracting(true);
      try {
        let text = "";
        switch (selectedDoc.fileType.toLowerCase()) {
          case "pdf":
            text = await extractTextFromPDF(selectedDoc.uri);
            break;
          case "docx":
            text = await extractTextFromDOCX(selectedDoc.uri);
            break;
          case "pptx":
          case "ppt":
            text = await extractTextFromPptx(selectedDoc.uri);
            break;
          case "jpeg":
          case "jpg":
          case "png":
            text = await extractTextFromImage(selectedDoc.uri);
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
    };

    extractText();
  }, [selectedDoc]);

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

  // ai stuff
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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

  return (
    <div className="flex h-full w-full gap-x-4">
      <div className="h-full w-1/3">
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
                    <div className="flex h-full animate-pulse items-center justify-center bg-gray-100">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
      <div className="scrollbar h-full w-2/3">
        <Tabs
          defaultValue="extractedText"
          className="flex h-full w-full flex-col"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="extractedText">Extracted Text</TabsTrigger>
            <TabsTrigger value="examNotes">Make Notes</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="quizeMe">Quize Me</TabsTrigger>
          </TabsList>
          <TabsContent
            value="extractedText"
            className="scrollbar flex-grow overflow-hidden"
          >
            <div className="flex h-full flex-col overflow-hidden p-4">
              <h2 className="mb-2 text-xl font-bold">Extracted Text</h2>
              {isExtracting ? (
                <Loader2 size="2rem" className="animate-spin" />
              ) : (
                <div className="scrollbar flex-grow overflow-y-auto whitespace-pre-wrap">
                  {extractedText}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="examNotes" className="flex-grow overflow-hidden">
            <div className="flex h-full flex-col p-4">
              <div className="scrollbar mb-4 flex-grow overflow-y-auto rounded bg-gray-800 p-4 text-foreground">
                {<MarkdownRenderer content={response} /> ||
                  error ||
                  "Click 'Generate Exam Notes' to create detailed study notes."}
                {isGenerating && <span className="animate-pulse">|</span>}
              </div>
              <Button onClick={handleGenerate}>
                {isGenerating ? "Generating..." : "Generate Exam Notes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="flex-grow overflow-hidden">
            <div className="flex h-full flex-col p-4">
              <h2 className="mb-4 text-xl font-bold">Related YouTube Videos</h2>
              <p className="mb-4 text-sm text-gray-600">
                Search string: {searchString}
              </p>
              <div className="scrollbar flex-grow overflow-y-auto">
                <YouTubeVideos keywords={[searchString]} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="quizeMe" className="flex-grow overflow-hidden">
            <div className="flex h-full flex-col p-4">
              <div className="scrollbar mb-4 flex-grow overflow-y-auto rounded bg-gray-800 p-2 text-gray-300"></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MaterialView;
