import { Metadata } from "next";
import { redirect } from "next/navigation";
import OnBoardText from "~/components/auth/OnBoardText";
import Header from "~/components/Header/Header";
import MobileHamburger from "~/components/Header/MobileHamburger";
import SideNav from "~/components/sidebar/SideNav";
import { useCourses } from "~/hooks/useGetCourses";

export const metadata: Metadata = {
  title: {
    template: "%s | ACADEMIA",
    default: "HOME",
  },
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full overflow-y-hidden bg-bground1 bg-bgImage bg-cover bg-center bg-no-repeat p-2.5 font-khula text-text">
      <div className="sticky top-0 hidden h-screen md:block">
        <SideNav />
      </div>
      <div className="flex w-full flex-col">
        <div className="sticky top-0 z-10">
          <Header />
        </div>
        <div className="scrollbar h-full flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
