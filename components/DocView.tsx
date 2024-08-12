"use client";

import React, { useEffect, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { Loader2 } from "lucide-react";

const LoadingRenderer = ({
  name,
  fileType,
}: {
  name: string;
  fileType: string;
}) => {
  const fileText = name || fileType || "";
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 size="2rem" className="animate-spin" />
    </div>
  );
};

const DocView = () => {
  const doc = [
    // {
    //   uri: "http://localhost:8000/api/admin/file/1lUHVyGsQD67QzUYZ1gFqXMBoS80kHSAZ",
    //   fileType: "pdf",
    //   name: "test.pdf",
    // },
    {
      uri: "https://res.cloudinary.com/dkysrpdi6/raw/upload/v1722515587/1_X9YobSJnZjwm9hNEVhlZhp1lwvEMsVD_xqzsjn.docx",
      fileType: "docx",
      name: "test.docx",
    },
  ];

  const [selectedDoc, setSelectedDoc] = useState(doc[0]); // Fixed typo here

  return (
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
            overrideComponent: () => (
              <LoadingRenderer
                name={selectedDoc.name}
                fileType={selectedDoc.fileType}
              />
            ),
          },
        }}
        pluginRenderers={DocViewerRenderers}
      />
    </div>
  );
};

export default DocView;
