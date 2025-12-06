import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const isLoggedIn = auth.isAuthenticated
  const router = useRouter()

  // If trying to access protected routes while not logged in
  if (to.path.startsWith('/admin') && !isLoggedIn) {
    return navigateTo('/auth/login')
  }

  // If trying to access login page while already logged in
  if (to.path === '/auth/login' && isLoggedIn) {
    return navigateTo('/admin')
  }
})
