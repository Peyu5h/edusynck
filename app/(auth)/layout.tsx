import { Metadata } from "next";
import { redirect } from "next/navigation";
import OnBoardText from "~/components/auth/OnBoardText";

export const metadata: Metadata = {
  title: "Auth",
};

export default async function Authlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-bgImage bg-cover bg-center bg-no-repeat p-36">
      <div
        style={{ zIndex: 2 }}
        className="absolute inset-0 bg-black opacity-20"
      ></div>
      <div className="flex w-full max-w-[1368px] flex-col items-center justify-between lg:flex-row">
        <OnBoardText />
        {children}
      </div>
    </div>
  );
}
