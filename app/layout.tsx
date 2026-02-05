import type { Metadata } from "next";
import { Unbounded, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PrismLoader from "@/components/PrismLoader";

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "shuv's site",
  description: "Shuvam Mandal's Personal Website",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${unbounded.variable} ${syne.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <PrismLoader />
        {children}
      </body>
    </html>
  );
}
