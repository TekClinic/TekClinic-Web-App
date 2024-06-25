import { getToken, type JWT } from 'next-auth/jwt'
import { requireBuildEnv } from '@/src/api/utils'
import { type NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'

// handleEmptyToken is used to handle the case when the token is empty, i.e., the user is not logged in.
const handleEmptyToken = async (): Promise<NextResponse<{ error: string }>> => {
  const response = { error: 'No session present' }
  const responseHeaders = { status: StatusCodes.BAD_REQUEST }
  return NextResponse.json(response, responseHeaders)
}

// handleError is used to handle the case when an error occurs during the logout process.
const handleError = async (): Promise<NextResponse<{ error: string }>> => {
  const response = { error: 'Unable to logout from the session' }
  const responseHeaders = { status: StatusCodes.INTERNAL_SERVER_ERROR }
  return NextResponse.json(response, responseHeaders)
}

// sendEndSessionEndpointToURL sends the end session endpoint to the federated identity provider.
// The end session endpoint is used to log out the user from the federated identity provider.
const sendEndSessionEndpointToURL = async (token: JWT): Promise<NextResponse<{ url: string }>> => {
  const endSessionEndPoint = new URL(
    `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
  )
  const logoutParams: Record<string, string> = {
    id_token_hint: token.idToken as string,
    post_logout_redirect_uri: requireBuildEnv('process.env.NEXTAUTH_URL', process.env.NEXTAUTH_URL)
  }
  const endSessionParams = new URLSearchParams(logoutParams)
  const response = { url: `${endSessionEndPoint.href}/?${endSessionParams.toString()}` }
  return NextResponse.json(response)
}

// GET /api/auth/federated-logout
// Logs out the user from the application and the federated identity provider.
export async function GET (req: NextRequest): Promise<NextResponse<{
  error: string
} | { url: string }>> {
  try {
    const token = await getToken({ req })
    if (token != null) {
      return await sendEndSessionEndpointToURL(token)
    }
    return await handleEmptyToken()
  } catch (error) {
    console.error(error)
    return await handleError()
  }
}

// force dynamic rendering of this route
export const dynamic = 'force-dynamic'
