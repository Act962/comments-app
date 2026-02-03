import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comments App",
  description: "Automative seu Instagram de forma inteligente",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.png",
        href: "/logo.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.png",
        href: "/logo-dark.png",
      },
    ],
  },
  openGraph: {
    title: "Comments App",
    description: "Automative seu Instagram de forma inteligente",
    url: "https://comments.nasaex.com",
    type: "website",
    locale: "pt-BR",
    siteName: "Comments App",
    images: [
      {
        url: "https://comments.nasaex.com/logo.png",
        width: 500,
        height: 500,
        alt: "Comments App",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={raleway.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
