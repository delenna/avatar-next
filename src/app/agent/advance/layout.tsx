import type {Metadata} from "next";
import "@/app/globals.css";
import {BackgroundWave} from "@/app/components/background-wave";

export const metadata: Metadata = {
    title: "Advance Agent",
};

export default function AdvanceAgentLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
            {children}
            <BackgroundWave/>
        </div>
    );
}