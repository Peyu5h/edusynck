import { Metadata } from "next";
import { redirect } from "next/navigation";
import OnBoardText from "~/components/auth/OnBoardText";
import SideNav from "~/components/sidebar/SideNav";

export const metadata: Metadata = {
  title: "HOME",
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-khula relative flex h-screen w-full bg-bground1 bg-bgImage bg-cover bg-center bg-no-repeat p-2.5">
      <SideNav />

      {children}
    </div>
  );
}
