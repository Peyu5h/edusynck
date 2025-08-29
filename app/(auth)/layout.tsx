import { Metadata } from "next";
import { redirect } from "next/navigation";
import OnBoardText from "~/components/auth/OnBoardText";
import ApiWarmup from "~/components/ApiWarmup";

export const metadata: Metadata = {
  title: "Auth",
};

export default async function Authlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-x-hidden overflow-y-hidden bg-bgImage bg-cover bg-center bg-no-repeat p-36">
      {/* Warm API on auth pages too */}
      <ApiWarmup />
      <div
        style={{ zIndex: 2 }}
        className="absolute inset-0 bg-black opacity-20"
      ></div>
      <div className="flex w-full max-w-[1368px] flex-col items-center justify-between lg:flex-row">
        <OnBoardText />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
