import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TanstackProvider from "@/lib/tanstack/provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
import { Toaster } from "sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Utkarsh Chaudhary",
    template: "%s | Utkarsh Chaudhary",
  },
  description:
    "This website showcases my work and projects that delivers high quality content. I also write blogs on my learnings and experiences.",
  metadataBase: new URL("https://utkarshchaudhary.vercel.app"),
  keywords: [
    "Utkarsh Chaudhary",
    "Ai",
    "Software Engineer",
    "Web Developer",
    "Blog",
    "Projects",
  ],
  authors: [
    { name: "Utkarsh Chaudhary", url: "https://utkarshchaudhary.vercel.app" },
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Utkarsh Chaudhary",
    description:
      "This website showcases my work and projects that delivers high quality content. I also write blogs on my learnings and experiences.",
    url: "https://utkarshchaudhary.vercel.app",
    siteName: "Utkarsh Chaudhary",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
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
    <ClerkProvider>
      <html
        lang='en'
        suppressHydrationWarning
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <TanstackProvider>
              <Toaster position='top-right' />
              <div className='mx-2 md:mx-10'>{children}</div>
            </TanstackProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
