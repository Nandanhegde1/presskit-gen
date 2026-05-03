import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PresskitGen - Press Kits for Musicians, Game Devs & Indie Creators",
  description: "Auto-fill from Spotify, Bandcamp, Steam or itch.io. Beautiful, SEO-optimized press kits in 5 minutes. Free to start.",
  keywords: ["press kit", "EPK", "electronic press kit", "musician press kit", "band press kit", "indie game press kit", "media kit", "presskit"],
  authors: [{ name: "PresskitGen" }],
  openGraph: {
    title: "PresskitGen - Press Kits for Indie Creators",
    description: "Auto-fill from Spotify, Bandcamp, Steam or itch.io. Free to start.",
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
    title: "PresskitGen - Press Kits for Indie Creators",
    description: "Auto-fill from Spotify, Bandcamp, Steam or itch.io. Free to start.",
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
