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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex p-4 items-center text-sm">
          <div className="grow">LOGO</div>
          <div className="grow-0 basis-[400px]">
            <input placeholder="Search" className="rounded-md w-full border-neutral-700 border p-2 bg-transparent"></input>
          </div>
          <div className="grow relative">
            <nav className="float-right">
              <ul className="flex gap-10 font-semibold">
                <li>Profile</li>
                <li>Investing</li>
                <li>History</li>
                <li>Settings</li>
                <li>Log Out</li>
              </ul>
            </nav>
          </div>
        </div>
        {children}
        <footer className="p-4 bg-neutral-900">
          <p>Project by Patrick Valera 2024</p>
        </footer>
      </body>
    </html>
  );
}
