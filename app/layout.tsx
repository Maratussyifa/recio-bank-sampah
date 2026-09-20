import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Recio — Bank Sampah Digital",
  description: "Ubah sampah jadi poin bernilai, mulai hari ini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} ${lora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}