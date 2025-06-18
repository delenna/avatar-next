import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Login",
};

export default function LoginLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
            {children}
        </div>
    );
}