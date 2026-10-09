import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Paper Corrector",
  description: "AI-assisted handwritten answer sheet evaluation with teacher review."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
