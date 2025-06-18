import { LoginForm } from "@/app/components/login-form"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm bg-gray-100 p-6 rounded-lg shadow-lg dark:bg-gray-900">
        <LoginForm />
      </div>
    </div>
  )
}
