// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Import font dari Google Fonts
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // pilih variasi ketebalan
});

export const metadata: Metadata = {
  title: "DISHUB ACEH - Dashboard Monitoring",
  description: "Dashboard monitoring cuaca laut dan jadwal kapal DISHUB Aceh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Terapkan font Poppins ke seluruh halaman */}
      <body className={`${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
