import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/lib/authContext.js";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <div className="min-h-screen bg-white text-black">
          <UserProvider>
            <Header />
            <Toaster />
            <div className="flex">
              <Sidebar />
              <div className="flex-1">{children}</div>
            </div>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
