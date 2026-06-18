import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World 2046",
  description: "En interaktiv 3D worldbuilding-prototype om fremtidens valg.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
