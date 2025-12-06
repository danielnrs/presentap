import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'
import type { Ref } from 'vue'

type User = {
  id: number
  username: string
  // Add other user properties as needed
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated: Ref<boolean> = ref(false)
  const user: Ref<User | null> = ref(null)
  const token: Ref<string | null> = ref(null)

  // Initialize from localStorage if available
  if (process.client) {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      isAuthenticated.value = true
      // Optionally fetch user data here if needed
    }
  }

  function setAuth(newToken: string, userData: User) {
    token.value = newToken
    user.value = userData
    isAuthenticated.value = true
    
    if (process.client) {
      localStorage.setItem('token', newToken)
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    
    if (process.client) {
      localStorage.removeItem('token')
    }
    
    // Use nextTick to ensure the store is updated before navigation
    nextTick(() => {
      navigateTo('/auth/login')
    })
  }

  return {
    isAuthenticated,
    user,
    token,
    setAuth,
    logout
  }
})
