import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import GrainOverlay from "@/components/ui/GrainOverlay";
import SmoothScrollProvider from "@/components/primitives/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rial Estate — L'agent IA qui qualifie vos leads pendant que vous dormez",
  description:
    "Qualification de leads immobiliers en moins de 30 secondes, 24/7. Pour agences indépendantes. Sans recruter, sans SDR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background-deep text-text-primary">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <GrainOverlay />
      </body>
    </html>
  );
}
