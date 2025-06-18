import type { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Smart Agent',
}

export default function SmartAgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 dark:bg-gray-900">
        {children}
    </div>
  )
}
