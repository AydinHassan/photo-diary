export default defineNuxtRouteMiddleware(async (to) => {
  const {loggedIn, fetch } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
