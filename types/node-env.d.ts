import 'next-auth'

// Expand the Session type. Make accessToken available across the app for API calls.
// Also, add an error field to the session to store any errors that occur during auth process.
declare module 'next-auth' {
  interface Session {
    accessToken: string
    error?: string
  }
}
