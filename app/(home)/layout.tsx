import { Metadata } from "next";
import { redirect } from "next/navigation";
import OnBoardText from "~/components/auth/OnBoardText";
import Header from "~/components/Header/Header";
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
    <div className="relative flex h-screen w-full bg-bground1 bg-bgImage bg-cover bg-center bg-no-repeat p-2.5 font-khula">
      <SideNav />
      <div className="flex w-full flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}
