import { useState, useEffect } from "react"
import { DashboardShell } from "./features/dashboard/DashboardShell"
import { LoginView } from "./features/auth/LoginView"
import { LandingView } from "./features/landing/LandingView"

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("flowpilot_jwt"))

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState(null, "", path)
    setCurrentPath(path)
  }

  if (currentPath === "/demo") {
    return (
      <DashboardShell
        isDemoMode={true}
        onLogout={() => navigate("/")}
      />
    )
  }

  if (currentPath === "/login") {
    if (isAuthenticated) {
      setTimeout(() => navigate("/dashboard"), 0)
      return null
    }
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true)
          navigate("/dashboard")
        }}
      />
    )
  }

  if (currentPath === "/dashboard") {
    if (!isAuthenticated) {
      setTimeout(() => navigate("/login"), 0)
      return null
    }
    return (
      <DashboardShell
        isDemoMode={false}
        onLogout={() => {
          localStorage.removeItem("flowpilot_jwt")
          setIsAuthenticated(false)
          navigate("/")
        }}
      />
    )
  }

  return <LandingView onNavigate={navigate} />
}

export default App
