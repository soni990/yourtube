import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/lib/authContext.js";
import { Toaster } from "@/components/ui/sonner";
import OTPVerification from "@/components/OTPVerification";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div className="min-h-screen bg-background text-foreground dark:bg-black dark:text-white">
          <UserProvider>
            <Header />
             <OTPVerification />
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
