export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, fetch } = useUserSession()

  console.log('[auth] start', {
    path: to.path,
    loggedInBefore: loggedIn.value,
    server: import.meta.server,
  })

  try {
    await fetch()
  } catch (err) {
    console.error('[auth] fetch() failed', err)
  }

  console.log('[auth] after fetch', {
    path: to.path,
    loggedInAfter: loggedIn.value,
    user: user.value,
  })

  if (!loggedIn.value) {
    console.log('[auth] redirecting → /login', { path: to.path })
    return navigateTo('/login')
  }

  console.log('[auth] access granted', { path: to.path })
})
