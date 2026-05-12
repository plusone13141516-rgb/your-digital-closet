import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "数字衣橱",
  description: "个人衣橱 + 趋势灵感搭配（仅衣服单品图）。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[var(--dc-bg)] text-[var(--dc-primary-ink)] font-sans">
        {children}
      </body>
    </html>
  );
}
