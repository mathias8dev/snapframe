import type { Metadata } from "next";
import { DM_Sans, Inter, Playfair_Display, Poppins, Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const poppins = Poppins({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "SnapFrame — App Store Screenshot Generator",
  description: "Create stunning App Store and Google Play screenshots with an intuitive editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${inter.variable} ${playfair.variable} ${poppins.variable} ${montserrat.variable} ${spaceGrotesk.variable} bg-background text-foreground font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
