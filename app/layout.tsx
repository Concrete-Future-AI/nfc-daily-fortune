import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "健康运势助手",
  description: "基于NFC的健康运势助手，提供个性化的健康建议",
  keywords: "健康,运势,NFC,健康建议,个性化",
  authors: [{ name: "健康运势助手" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
