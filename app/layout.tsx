import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Signal / learn — AI-Assisted Work Feedback",
  description: "Bring one thing you made with AI — find out if it's good, and if you're using AI well.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
