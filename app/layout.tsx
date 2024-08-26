import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "~/store/ReduxProvider";
import ReactQueryProvider from "~/components/ReactQueryProvider";
import UserHydration from "~/store/slices/useUserHydration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | ACADEMIA",
    default: "ACADEMIA",
  },
  description: "Description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <UserHydration />
              {children}
            </ThemeProvider>
            <Toaster />
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
