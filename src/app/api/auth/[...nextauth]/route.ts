import NextAuth, { type AuthOptions, type TokenSet } from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { requireBuildEnv } from '@/src/api/utils'
import { type JWT } from 'next-auth/jwt'

const authOptions: AuthOptions = {
  // Configure Keycloak as the identity provider
  providers: [
    KeycloakProvider({
      clientId: requireBuildEnv('KEYCLOAK_CLIENT_ID', process.env.KEYCLOAK_CLIENT_ID),
      clientSecret: requireBuildEnv('KEYCLOAK_CLIENT_SECRET', process.env.KEYCLOAK_CLIENT_SECRET),
      issuer: requireBuildEnv('KEYCLOAK_ISSUER', process.env.KEYCLOAK_ISSUER)
    })
  ],
  // Configure the session to expire after 30 minutes
  session: {
    maxAge: 60 * 30
  },
  // Configure the JWT callback to refresh the access token when it expires
  callbacks: {
    async jwt ({ token, account }) {
      // If this callback is called during the initial sign in, the tokens are fresh
      if (account != null) {
        token.idToken = account.id_token
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        return token
      }

      // If the token has expired, refresh it
      if (Date.now() < ((token.expiresAt as number) * 1000 - 60 * 1000)) {
        return token
      } else {
        try {
          const freshToken = await requestRefreshOfAccessToken(token)
          const updatedToken: JWT = {
            ...token, // Keep the previous token properties
            idToken: freshToken.id_token,
            accessToken: freshToken.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + (freshToken.expires_in as number)),
            refreshToken: freshToken.refresh_token ?? token.refreshToken
          }
          return updatedToken
        } catch (error) {
          console.error('Error refreshing access token', error)
          return { ...token, error: 'RefreshAccessTokenError' }
        }
      }
    },
    // Add the access token to the session object
    async session ({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    }
  }
}

// requestRefreshOfAccessToken is a helper function to refresh the access token using the refresh token.
const requestRefreshOfAccessToken = async (token: JWT): Promise<TokenSet> => {
  const response = await fetch(
    `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: requireBuildEnv('KEYCLOAK_CLIENT_ID',
          process.env.KEYCLOAK_CLIENT_ID),
        client_secret: requireBuildEnv('KEYCLOAK_CLIENT_SECRET',
          process.env.KEYCLOAK_CLIENT_SECRET),
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string
      }),
      method: 'POST',
      cache: 'no-store'
    })
  if (!response.ok) throw await response.json()
  return await response.json() as TokenSet
}

// Delegate GET and POST requests to NextAuth
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
