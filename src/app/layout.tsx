import type { Metadata } from "next";
import { Fraunces, Orbitron, Share_Tech_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-display" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body" });
const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono-scifi" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "World 2046",
  description: "En interaktiv 3D worldbuilding-prototype om fremtidens valg.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className={`${orbitron.variable} ${spaceGrotesk.variable} ${shareTechMono.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
