import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milestone Mirror - Compare Your Children's Photos",
  description:
    "Compare photos of your children at the same ages. See how they looked at 3 months, 1 year, and other milestones side by side.",
  keywords: ["photos", "children", "comparison", "milestones", "family", "memories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
