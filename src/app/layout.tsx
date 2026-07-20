import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-mono-scifi" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "World 2046",
  description: "En interaktiv 3D worldbuilding-prototype om fremtidens valg.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className={`${inter.variable} ${ibmPlexMono.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <div className="film-grain" aria-hidden />
      </body>
    </html>
  );
}
