import type { Session } from 'next-auth'
import { signIn, signOut, useSession } from 'next-auth/react'

// useGuaranteeSession is used to receive the session object from the context that is guaranteed to be authenticated.
// If the session is not authenticated, it will redirect to the login page.
export const useGuaranteeSession = (): Session => {
  const session = useSession({ required: true })
  if (session.status !== 'authenticated' || session.data.error === 'RefreshAccessTokenError') {
    // Impossible to reach this point
    void signIn('keycloak')
    throw new Error('Session not authenticated. If you see this error, please report it to the developers.')
  }
  return session.data
}

// federatedLogout is used to log out the user from the application and the federated identity provider.
// signOut only logs out the user from the application and not the federated identity provider.
export const federatedLogout = async (): Promise<void> => {
  const response = await fetch('/api/auth/federated-logout')
  const data = await response.json()
  await signOut({ redirect: false })

  if (response.ok) {
    window.location.href = data.url
    return
  }
  console.error('Federated logout failed:', data.error)
}
