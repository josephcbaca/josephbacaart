import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joseph Baca // Notification Core & Gallery Portal",
  description: "Terminal entry, dispatch feed, and walkthrough gallery.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-[#ededed] antialiased overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}