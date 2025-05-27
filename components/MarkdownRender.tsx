import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

interface ComponentProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

interface CodeProps extends ComponentProps {
  inline?: boolean;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: {
    [key: string]: React.FC<ComponentProps> | React.FC<CodeProps>;
  } = {
    h1: ({ node, ...props }: ComponentProps) => (
      <h1 className="mb-4 text-3xl font-bold" {...props} />
    ),
    h2: ({ node, ...props }: ComponentProps) => (
      <h2 className="mb-3 text-2xl font-semibold" {...props} />
    ),
    h3: ({ node, ...props }: ComponentProps) => (
      <h3 className="mb-2 text-xl font-semibold" {...props} />
    ),
    p: ({ node, ...props }: ComponentProps) => (
      <p className="mb-4" {...props} />
    ),
    ul: ({ node, ...props }: ComponentProps) => (
      <ul className="mb-4 list-disc pl-5" {...props} />
    ),
    ol: ({ node, ...props }: ComponentProps) => (
      <ol className="mb-4 list-decimal pl-5" {...props} />
    ),
    li: ({ node, ...props }: ComponentProps) => (
      <li className="mb-1" {...props} />
    ),
    a: ({ node, ...props }: ComponentProps) => (
      <a className="text-blue-500 hover:underline" {...props} />
    ),
    blockquote: ({ node, ...props }: ComponentProps) => (
      <blockquote
        className="mb-4 border-l-4 border-gray-300 pl-4 italic"
        {...props}
      />
    ),
    code: ({ node, inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="mb-4 rounded-md bg-bground2"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="rounded-md bg-bground2 px-1.5 py-1" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
