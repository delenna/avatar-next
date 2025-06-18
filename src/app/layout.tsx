import type {Metadata} from "next";
import "./globals.css";
import {BackgroundWave} from "@/app/components/background-wave";

export const metadata: Metadata = {
    title: "ConvAI",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="h-full w-full dark" suppressHydrationWarning>
        <body className="antialiased w-full h-full flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4 dark:bg-gray-900">
                {children}
                {/* <BackgroundWave/> */}
            </div>
        </body>
        </html>
    );
}