import { SITE } from '@/lib/template-config'
import { PasswordGate } from '@/components/password-gate'

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#2a1426_0%,#0b070c_70%)] sm:p-6">
      <h1 className="sr-only">{SITE.title}</h1>
      <PasswordGate />
    </main>
  )
}
