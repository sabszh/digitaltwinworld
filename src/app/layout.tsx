import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-mono-scifi" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "World 2046",
  description: "En interaktiv 3D worldbuilding-prototype om fremtidens valg.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className={`${dmSans.variable} ${ibmPlexMono.variable} ${cormorant.variable}`}>
      <body>
        {children}
        <div className="film-grain" aria-hidden />
      </body>
    </html>
  );
}
