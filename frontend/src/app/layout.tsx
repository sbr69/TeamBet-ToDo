import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "To-Do Team Bet",
  description: "A decentralized to-do list where teams stake MNT to stay accountable. Complete tasks on time or fund the team party!",
  keywords: ["Web3", "Mantle", "ToDo", "dApp", "Blockchain", "Task Management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
