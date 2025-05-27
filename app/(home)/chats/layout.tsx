import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHATS",
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="overflow-hidden">{children}</div>;
}
