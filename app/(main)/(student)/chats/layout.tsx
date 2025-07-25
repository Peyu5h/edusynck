import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHATS",
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex h-full min-h-0 w-full flex-col">{children}</div>;
}
