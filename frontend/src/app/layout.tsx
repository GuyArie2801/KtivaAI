import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "KtivaAI - מערכת הערכה לחיבור הפסיכומטרי",
  description: "הערכה מדויקת ומקצועית לחיבור הפסיכומטרי (מטלת הכתיבה) המבוססת על מחוון המרכז הארצי",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-slate-50">{children}</body>
    </html>
  );
}
