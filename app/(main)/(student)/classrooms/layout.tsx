import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLASSROOMS",
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
