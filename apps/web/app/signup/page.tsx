"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/app/providers/auth-provider"

export default function SignupPage() {
  const { signUp, verifyTwoFactor, resendTwoFactor } = useAuth()
  const [step, setStep] = React.useState<"details" | "code">("details")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [telegram, setTelegram] = React.useState("")
  // Honeypot: invisible to people, irresistible to form-filling bots.
  const [website, setWebsite] = React.useState("")
  const [code, setCode] = React.useState("")
  const [maskedEmail, setMaskedEmail] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const [resendIn, setResendIn] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Every new account verifies its email before it can be used.
      const result = await signUp({ name, email, password, telegram, website })
      setMaskedEmail(result.email || email)
      setStep("code")
      setResendIn(30)
      setNotice(result.emailSent === false ? "We couldn't email the code — contact support." : "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await verifyTwoFactor(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setNotice("")
    try {
      const r = await resendTwoFactor()
      setResendIn(30)
      setNotice(`A new code was sent to ${r.email || maskedEmail}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code")
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - cartoon illustration */}
      <div className="hidden lg:flex lg:w-[45%] bg-[oklch(0.145_0_0)] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/signup-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.145_0_0)] via-[oklch(0.145_0_0)/0.7] to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-8 w-full">
          <div />

          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-5 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white" viewBox="0 0 44 45" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M18.4201 9.7905C19.2053 10.2438 19.4743 11.2477 19.021 12.0329L10.8134 26.2488C10.3601 27.034 9.35616 27.3029 8.57104 26.8497C7.78592 26.3964 7.51689 25.3924 7.9702 24.6073L16.1778 10.3913C16.6311 9.60622 17.635 9.33722 18.4201 9.7905ZM27.7561 13.3169C28.5412 13.7702 28.8102 14.7741 28.3569 15.5592L18.5078 32.6184C18.0545 33.4035 17.0506 33.6725 16.2655 33.2192C15.4803 32.7659 15.2113 31.762 15.6646 30.9769L25.5137 13.9177C25.967 13.1326 26.9709 12.8636 27.7561 13.3169ZM36.7357 20.7424C37.2646 19.8265 37.0569 18.7165 36.2717 18.2632C35.4866 17.8099 34.4214 18.185 33.8926 19.1009L24.317 35.6862C23.7882 36.6022 23.9959 37.7122 24.7811 38.1655C25.5662 38.6188 26.6314 38.2437 27.1602 37.3277L36.7357 20.7424Z" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Start Your Journey</h2>
            <p className="text-white/60 text-sm max-w-sm mx-auto">
              Join AlphaReserve and grow your portfolio
            </p>
          </div>

          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>© 2026 AlphaReserve</span>
            <span>Secure</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-background" viewBox="0 0 44 45" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.4201 9.7905C19.2053 10.2438 19.4743 11.2477 19.021 12.0329L10.8134 26.2488C10.3601 27.034 9.35616 27.3029 8.57104 26.8497C7.78592 26.3964 7.51689 25.3924 7.9702 24.6073L16.1778 10.3913C16.6311 9.60622 17.635 9.33722 18.4201 9.7905ZM27.7561 13.3169C28.5412 13.7702 28.8102 14.7741 28.3569 15.5592L18.5078 32.6184C18.0545 33.4035 17.0506 33.6725 16.2655 33.2192C15.4803 32.7659 15.2113 31.762 15.6646 30.9769L25.5137 13.9177C25.967 13.1326 26.9709 12.8636 27.7561 13.3169ZM36.7357 20.7424C37.2646 19.8265 37.0569 18.7165 36.2717 18.2632C35.4866 17.8099 34.4214 18.185 33.8926 19.1009L24.317 35.6862C23.7882 36.6022 23.9959 37.7122 24.7811 38.1655C25.5662 38.6188 26.6314 38.2437 27.1602 37.3277L36.7357 20.7424Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-foreground">AlphaReserve</span>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-foreground mb-1">{step === "code" ? "Verify your email" : "Create account"}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {step === "code" ? (
              <>We sent a 6-digit code to <span className="font-medium text-foreground">{maskedEmail}</span>. It&apos;s valid for 10 minutes.</>
            ) : (
              "Enter your details"
            )}
          </p>

          {notice && (
            <div className="mb-4 rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">{notice}</div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-[var(--bg-danger)] border border-destructive/25 rounded-lg text-destructive text-xs">
              {error}
            </div>
          )}

          {step === "code" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-center text-lg font-mono tracking-[0.4em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendIn > 0}
                className="w-full text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot — hidden from people, so anything typed here is a bot. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Telegram</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors text-sm"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground text-center">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-foreground hover:underline">Terms</a>
          </p>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}