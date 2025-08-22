import { Metadata } from "next";

import Header from "~/components/Header/Header";
import RoleGuard from "~/components/RoleGuard";
import SideNav from "~/components/sidebar/SideNav";

export const metadata: Metadata = {
  title: {
    template: "%s | EDUSYNC",
    default: "HOME",
  },
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="relative flex h-screen w-full overflow-x-hidden overflow-y-hidden bg-bground1 bg-bgImage bg-cover bg-center bg-no-repeat p-2.5 font-khula text-text">
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
    </RoleGuard>
  );
}
