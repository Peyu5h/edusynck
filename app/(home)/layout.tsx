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
  const getCourses = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/clzi4drbb0000kx7z8mydzpdh/courses`,
      { cache: "force-cache" },
    );
    const data = await res.json();
    return data;
  };

  const courses = await getCourses();

  return (
    <div className="relative flex h-screen w-full overflow-y-hidden bg-bground1 bg-bgImage bg-cover bg-center bg-no-repeat p-2.5 font-khula text-text">
      <div className="sticky top-0 h-screen">
        <SideNav courses={courses} />
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
