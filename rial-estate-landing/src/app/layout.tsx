import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GrainOverlay from "@/components/ui/GrainOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rial Estate — L'agent IA des agences immobilières indépendantes",
  description:
    "Réponse en 30 secondes, qualification, créneaux de visite proposés. Vos prospects ne tombent plus chez le concurrent d'à côté.",
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
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary-dark">
        {children}
        <GrainOverlay />
      </body>
    </html>
  );
}
