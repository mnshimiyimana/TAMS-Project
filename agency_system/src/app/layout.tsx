import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";


const workSans = Work_Sans({ 
  subsets: ["latin"],
  variable: "--font-work-sans", 
});

export const metadata: Metadata = {
  title: "TAMS",
  description: "Transport Agencies Management System",
  icons :{
    icon: "/bus-icon.svg",
    shortcut: "/bus-icon.png",
    apple: "/bus-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="bus-icon/.svg" type="image/x-icon" />
      </head>
      <body
        className={` ${workSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
