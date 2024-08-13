"use client";

import React, { useEffect, useState } from "react";
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

const DocView: React.FC = () => {
  const doc: IDocument[] = [
    {
      uri: "https://academiaa.onrender.com/api/admin/file/1VdPSV1gDrMOUCNhR2Xes4BwEavALYXlD",
      fileType: "jpeg",
      fileName: "test.docx",
    },
    // {
    //   uri: "https://academiaa.onrender.com/api/admin/file/141J5fh9QdZQ1aT4AzoC_eK26UDQrwHiG",
    //   fileType: "pdf",
    //   fileName: "test.pdf",
    // },
    // {
    //   uri: "https://academiaa.onrender.com/api/admin/file/141J5fh9QdZQ1aT4AzoC_eK26UDQrwHiG",
    //   fileType: "pdf",
    //   fileName: "test.pdf",
    // },
    // {
    //   uri: "https://academiaa.onrender.com/api/admin/file/1LLAYIB7637x4Z2m_LYPTzkrGFq1OYFrb",
    //   fileType: "pptx",
    //   fileName: "test.pptx",
    // },
  ];

  const [selectedDoc, setSelectedDoc] = useState<IDocument>(doc[0]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

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
      setIsExtracting(true);
      try {
        let text = "";
        switch (selectedDoc.fileType?.toLowerCase()) {
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

  return (
    <div className="flex h-full w-full">
      <div className="scrollbar h-full w-[30rem] overflow-y-scroll">
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
              overrideComponent: LoadingRenderer,
            },
          }}
          pluginRenderers={DocViewerRenderers}
        />
      </div>
      <div className="ml-4 w-[30rem] overflow-y-auto rounded border border-gray-200 p-4">
        <h2 className="mb-2 text-xl font-bold">Extracted Text</h2>
        {isExtracting ? (
          <Loader2 size="2rem" className="animate-spin" />
        ) : (
          <pre className="whitespace-pre-wrap">{extractedText}</pre>
        )}
      </div>
    </div>
  );
};

export default DocView;
