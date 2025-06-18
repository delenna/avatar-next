'use client'
import {ConvAI} from "@/app/components/ConvAI";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Button
        variant="ghost"
        onClick={() => router.push('/configuration')}
        className="fixed top-4 left-4 z-50 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Configuration
      </Button>
      <main className="flex flex-col gap-8 row-start-2 items-center w-full">
          <ConvAI />
      </main>
    </div>
  );
}
