import { useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"

import { apiClient } from "../../lib/apiClient"
import { Logo } from "../../components/Logo"

interface LoginViewProps {
  onLoginSuccess: () => void
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)

    try {
      const res = await apiClient.post("/api/auth/login", { email, password })
      localStorage.setItem("flowpilot_jwt", res.token)
      setIsLoading(false)
      onLoginSuccess()
    } catch (err: any) {
      // Auto-register on the fly for demo ease if user doesn't exist
      try {
        const regRes = await apiClient.post("/api/auth/register", {
          name: email.split("@")[0] || "Admin",
          email,
          password
        })
        localStorage.setItem("flowpilot_jwt", regRes.token)
        setIsLoading(false)
        onLoginSuccess()
      } catch {
        setError(err.message || "Authentication failed.")
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[380px] space-y-6">
        {/* Wordmark logo above card */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <Logo size={36} />
          <p className="text-[11px] text-muted-foreground font-medium mt-1">
            Autonomous Revenue Intelligence Platform
          </p>
        </div>

        <Card className="border-border bg-card/40 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Enter your credentials to access the Veda Wellness control center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded border border-destructive/20 bg-destructive/10 p-2.5 text-[11px] font-semibold text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@vedawellness.fit"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => e.preventDefault()}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-xs font-semibold h-9 mt-2 relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            New business?{" "}
            <a
              href="#contact"
              onClick={(e) => e.preventDefault()}
              className="font-semibold text-primary hover:underline"
            >
              Contact our solutions team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginView
