import Keycloak, { type KeycloakConfig, type KeycloakInitOptions } from 'keycloak-js'
import React, { createContext, useEffect, useState } from 'react'
import { requireBuildEnv } from '@/src/api/utils'

/**
 * KeycloakConfig configures the connection to the Keycloak server.
 */
const keycloakConfig: KeycloakConfig = {
  realm: 'tekclinic',
  clientId: 'web-app',
  url: requireBuildEnv('NEXT_PUBLIC_AUTH_URL', process.env.NEXT_PUBLIC_AUTH_URL)
}

const keycloakInitOptions: KeycloakInitOptions = {
  // Configure that Keycloak will check if a user is already authenticated (when opening the app or reloading the page). If not authenticated the user will be sent to the login form. If already authenticated the webapp will open.
  onLoad: 'login-required',
  checkLoginIframe: false
}

let keycloak: Keycloak
/**
 * AuthContextValues defines the structure for the default values of the {@link AuthContext}.
 */
export interface AuthContextValues {
  /**
   * Whether a user is currently authenticated
   */
  isAuthenticated: boolean
  /**
   * Function to initiate the logout
   */
  logout: () => Promise<void>
  /**
   * The name of the authenticated user
   */
  username: string
  /**
  * Check if the user has the given role
  */
  hasRole: (role: string) => boolean

  /**
   * Keycloak token for user Authentication
   */
  keycloakToken: string | undefined
}

const defaultAuthContextValues: AuthContextValues = {
  isAuthenticated: false,
  logout: async () => { },
  username: '',
  hasRole: () => false,
  keycloakToken: ''
}

/**
 * AuthContext is the context exposed by the {@link AuthContextProvider}.
 */
export const AuthContext = createContext<AuthContextValues>(
  defaultAuthContextValues
)

/**
 * The props that must be passed to create the {@link AuthContextProvider}.
 */
interface AuthContextProviderProps {
  /**
   * The elements wrapped by the auth context.
   */
  children: React.JSX.Element
}

/**
 * AuthContextProvider is responsible for managing the authentication state of the current user.
 *
 * @param props
 */
const AuthContextProvider = (props: AuthContextProviderProps): React.JSX.Element => {
  // Creating the local state to keep track of the authentication & the token
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false)
  const [keycloakToken, setToken] = useState<string | undefined>('')

  useEffect(() => {
    async function initializeKeycloak (): Promise<void> {
      try {
        const isAuthenticatedResponse = await keycloak.init(
          keycloakInitOptions
        )
        if (!isAuthenticatedResponse) {
          await keycloak.login({ prompt: 'none' })
        }
        setAuthenticated(isAuthenticatedResponse)
        // Updating token state
        setToken(keycloak.token)
      } catch {
        console.log('error initializing Keycloak')
        setAuthenticated(false)
      }
    }

    if (typeof window !== 'undefined') {
      keycloak = new Keycloak(keycloakConfig)
      // Initialize Keycloak here...
      void initializeKeycloak()
    }
  }, [])

  const logout = async (): Promise<void> => {
    await keycloak.logout()
  }

  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    /**
     * Load the profile for of the user from Keycloak
     */
    async function loadProfile (): Promise<void> {
      try {
        const profile = await keycloak.loadUserProfile()
        if (profile.firstName != null) {
          setUsername(profile.firstName)
        } else if (profile.username != null) {
          setUsername(profile.username)
        }
      } catch {
        console.log('error trying to load the user profile')
      }
    }

    // Only load the profile if a user is authenticated
    if (isAuthenticated) {
      void loadProfile()
    }
  }, [isAuthenticated])

  const hasRole = (role: string): boolean => {
    return keycloak.hasRealmRole(role)
  }

  return (
    // Creating the provider and passing the state into it. Whenever the state changes the components using this context will be re-rendered.
    <AuthContext.Provider value={{ isAuthenticated, logout, username, hasRole, keycloakToken }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
