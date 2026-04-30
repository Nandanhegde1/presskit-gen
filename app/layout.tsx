import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PresskitGen - Professional Press Kits for Indie Game Developers",
  description: "Create beautiful, professional press kits for your indie game in minutes. No coding required. Free to start, premium themes available.",
  keywords: ["press kit", "game dev", "indie game", "media kit", "game press", "presskit", "game marketing"],
  authors: [{ name: "PresskitGen" }],
  openGraph: {
    title: "PresskitGen - Press Kits for Indie Developers",
    description: "Create professional press kits in minutes",
    type: "website",
    url: "https://presskitgen.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PresskitGen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PresskitGen - Press Kits for Indie Developers",
    description: "Create professional press kits in minutes",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
