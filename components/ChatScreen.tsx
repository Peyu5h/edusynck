import { FaUser } from "react-icons/fa";
import MarkdownRenderer from "./MarkdownRender";
import { BsStars } from "react-icons/bs";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";
import { HiSparkles } from "react-icons/hi2";
import { Message } from "~/lib/types";

const EmptyScreen = ({
  setChatPrompt,
  isExtracting,
}: {
  setChatPrompt: (prompt: string) => void;
  isExtracting: boolean;
}) => {
  const exampleMessages = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the main takeaways from this text?",
    "Are there any important definitions I should know?",
  ];

  return (
    <div className="mx-auto bg-background px-8 text-foreground">
      <div className="-mt-10 flex w-full flex-col items-center justify-center rounded-md p-8">
        <span className="mb-8 flex items-center text-2xl"></span>
        <p className="mb-4 text-center leading-normal text-muted-foreground opacity-70">
          Ask questions about the document and get AI-powered responses.
        </p>
        <p className="mb-8 leading-normal text-muted-foreground opacity-70">
          Try an example:
        </p>
        <div className="flex flex-col items-start justify-start space-y-3">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => !isExtracting && setChatPrompt(message)}
              className={`h-auto w-full justify-start border-[0.5px] p-3 ${
                isExtracting ? "cursor-not-allowed opacity-50" : "opacity-80"
              }`}
              disabled={isExtracting}
            >
              <ArrowRightIcon className="mr-2 text-muted-foreground" />
              {message}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyScreen;

export const ChatItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className="group relative flex items-start bg-background px-8 py-5">
      <div className="-mt-1 flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-md border bg-background">
        {message.role === "user" ? <FaUser /> : <BsStars />}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MarkdownRenderer content={message.content} />
      </div>
    </div>
  );
};
