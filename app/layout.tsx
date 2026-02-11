import type { Metadata } from "next";
import {
  Geist_Mono,
  Liu_Jian_Mao_Cao,
  Noto_Serif_SC,
  Quicksand,
} from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import BlogThemeProvider from "@/components/theme-provider";


const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: "300",
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Noto Sans SC",
    "PingFang SC",
    "Microsoft YaHei",
    "sans-serif",
  ],
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: "300",
  display: "swap",
});

const logoFont = Liu_Jian_Mao_Cao({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Presto blog",
  description: "Presto blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${quicksand.variable} ${notoSerifSc.variable} ${logoFont.variable} ${geistMono.variable} antialiased`}
      >
        <BlogThemeProvider>
          {children}
        </BlogThemeProvider>
      </body>
    </html>
  );
}
