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
import * as PDFJS from "pdfjs-dist";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

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

const DocView: React.FC = () => {
  const doc: IDocument[] = [
    {
      uri: "http://localhost:8000/api/admin/file/1xU1Z55_GtWsIZqo_cyEI5kDfT-4-oixK",
      fileType: "docx",
      fileName: "test.docx",
    },
  ];

  const [selectedDoc, setSelectedDoc] = useState<IDocument>(doc[0]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const extractTextFromPDF = async (url: string): Promise<string> => {
    const pdf = await PDFJS.getDocument(url).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items.map((item) => ("str" in item ? item.str : "")).join(" ") +
        "\n";
    }
    return text;
  };

  const extractTextFromDOCX = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromXLSX = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    let text = "";
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      text += XLSX.utils.sheet_to_csv(sheet) + "\n\n";
    });
    return text;
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
          case "xlsx":
            text = await extractTextFromXLSX(selectedDoc.uri);
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
