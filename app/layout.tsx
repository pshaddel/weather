import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Red Bull Weather",
  description: "Weather App for Red Bull created by Digital Canvas Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: 'rgba(241,246,246,255)' }}>
        <div className="fixed left-0 top-0 w-full flex justify-center z-10 pt-4">
          <Image
            src="/logo.png"
            alt="Red Bull Logo"
            width={300}
            height={90}
            priority
            style={{ padding: "20px" }}
          />
        </div>
        <main className="flex flex-col items-center justify-between p-36 mt-20">
          {children}
        </main>
      </body>
    </html>
  );
}

