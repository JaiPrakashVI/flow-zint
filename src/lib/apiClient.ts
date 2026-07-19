import { useState, useEffect, useCallback } from "react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const apiClient = {
  async request(path: string, options: RequestInit = {}) {
    const url = `${API_BASE}${path}`
    const token = localStorage.getItem("flowpilot_jwt")

    const headers = new Headers(options.headers || {})
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json")
    }

    const response = await fetch(url, { ...options, headers })
    
    if (response.status === 401) {
      localStorage.removeItem("flowpilot_jwt")
      window.location.reload()
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || data.error || "Request failed")
    }
    return data
  },

  get(path: string, options?: RequestInit) {
    return this.request(path, { ...options, method: "GET" })
  },

  post(path: string, body: any, options?: RequestInit) {
    return this.request(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body)
    })
  },

  patch(path: string, body: any, options?: RequestInit) {
    return this.request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body)
    })
  },

  delete(path: string, options?: RequestInit) {
    return this.request(path, { ...options, method: "DELETE" })
  }
}

export function useQuery<T>(path: string, options: { refetchInterval?: number; enabled?: boolean } = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(options.enabled !== false)
  const [error, setError] = useState<string | null>(null)
  
  const enabled = options.enabled !== false
  const refetchInterval = options.refetchInterval

  const fetchData = useCallback(async () => {
    try {
      const res = await apiClient.get(path)
      setData(res)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    if (!enabled) return
    
    setLoading(true)
    fetchData()

    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, enabled, refetchInterval])

  return { data, loading, error, refetch: fetchData }
}

export function useMutation<T, K>(fetchFn: (arg: K) => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (arg: K): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn(arg)
      return res
    } catch (err: any) {
      setError(err.message || "Mutation failed")
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  return { mutate, loading, error }
}
