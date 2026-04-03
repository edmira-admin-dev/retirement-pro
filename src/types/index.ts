export interface AuthUser {
  id: string
  email: string
}

export interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
}

export interface ApiError {
  message: string
  status?: number
}
