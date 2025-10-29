import type { Metadata } from "next";
import { Poppins, Bangers } from "next/font/google";
import "./globals.css";

const poppins = Poppins ({
  variable: "--font-poppins",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Freela Facility Dashboard",
  description: 'Organize seus projetos freelance de forma inteligente',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${poppins.variable} antialiased`} lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
