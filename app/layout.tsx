import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "~/store/ReduxProvider";
import ReactQueryProvider from "~/components/ReactQueryProvider";
import UserProvider from "~/components/auth/UserProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | EDUSYNC",
    default: "EDUSYNC",
  },
  description: "Description",
  other: {
    "font-display": "swap",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/robson-bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Antic+Didone&family=Khula:wght@300;400;600;700;800&display=swap"
          as="style"
        />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <UserProvider />
              {children}
            </ThemeProvider>
            <Toaster />
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
