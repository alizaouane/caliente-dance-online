/**
 * Authentication types for Caliente Dance Online
 */

export type UserRole = 'admin' | 'member'

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthError {
  message: string
  code?: string
}

