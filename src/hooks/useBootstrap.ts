import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

export function useBootstrap() {
  const [ready, setReady] = useState(false)
  const { setAuth, accessToken, refreshToken } = useAuthStore()

  useEffect(() => {
    if (accessToken) {
      setReady(true)
      return
    }

    if (!refreshToken) {
      setReady(true)
      return
    }

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
      )
      .then(({ data }) => {
        const newAccessToken = data.data.accessToken as string
        // User not returned on refresh — re-derive from stored state or leave null
        // The user will be re-populated on next protected API call
        const storedUser = useAuthStore.getState().user
        if (storedUser) {
          setAuth(storedUser, newAccessToken, refreshToken)
        } else {
          // Store just the tokens — user will be fetched lazily
          sessionStorage.setItem('accessToken', newAccessToken)
          useAuthStore.setState({ accessToken: newAccessToken })
        }
      })
      .catch(() => {
        useAuthStore.getState().logout()
      })
      .finally(() => setReady(true))
  }, [])

  return ready
}
