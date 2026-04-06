import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "SmartReader",
  description: "A robust virtual smart board and book reader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#c8965a',
          colorBackground: '#1a1410',
          colorInputBackground: '#2e2720',
          colorText: '#e8ddd0',
          colorTextSecondary: '#a09080',
          borderRadius: '6px',
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}