"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"
import { useNotification } from "./NotificationContext"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showSuccess, showError } = useNotification()

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser()
        const isAuthenticated = authService.isAuthenticated()
        
        if (storedUser && isAuthenticated) {
          // Verify token is still valid by fetching fresh user data
          try {
            const response = await authService.getProfile()
            setUser(response.data.user)
          } catch (error) {
            // Token is invalid, clear storage
            authService.logout()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authService.login(credentials)
      const { user: userData, token } = response.data
      
      // Store auth data
      authService.storeAuthData(userData, token)
      setUser(userData)
      showSuccess("Login successful!")
      
      return { success: true, user: userData }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authService.register(userData)
      const { user: newUser, token } = response.data
      
      // Store auth data
      authService.storeAuthData(newUser, token)
      setUser(newUser)
      showSuccess("Account created successfully!")
      
      return { success: true, user: newUser }
    } catch (error) {
      // Extract error message from response
      let errorMessage = 'Registration failed'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Handle validation errors array
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ')
      }
      
      setError(errorMessage)
      showError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updatedData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authService.updateProfile(updatedData)
      const updatedUser = response.data.user
      
      // Update stored user data
      authService.storeAuthData(updatedUser, localStorage.getItem('authToken'))
      setUser(updatedUser)
      showSuccess("Profile updated successfully!")
      
      return { success: true, user: updatedUser }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      showSuccess("Logged out successfully!")
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setError(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        register, 
        updateUser, 
        logout, 
        clearError,
        isAuthenticated: !!user
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
