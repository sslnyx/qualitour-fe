import type { Metadata } from "next";
import { Poppins, ABeeZee, Dancing_Script, Kaushan_Script } from "next/font/google";
import "./globals.css";

// Self-hosted icon fonts (eliminates external CDN requests, includes font-display: swap)
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@fontsource/material-icons";
import "material-symbols/outlined.css";
import "eleganticons/css/style.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const aBeeZee = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-abeezee",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing-script",
});

const kaushanScript = Kaushan_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-kaushan-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qualitour - Travel & Tour Experiences",
  description: "Discover amazing travel experiences with Qualitour. Book tours, private transfers, visa services, and travel insurance.",
  keywords: ["tours", "travel", "vacation", "private transfers", "visa services", "travel insurance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${aBeeZee.variable} ${dancingScript.variable} ${kaushanScript.variable} font-sans antialiased`}
      >
        <div className="flex flex-col min-h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
