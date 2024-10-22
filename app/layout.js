import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Trading Platform",
  description: "Mock Trading Platform - Capstone Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`} >

  

        {children}

        <footer className="p-4 bg-neutral-900">
          <p>Project by Patrick Valera 2024</p>
        </footer>

      </body>
    </html>
  );
}
