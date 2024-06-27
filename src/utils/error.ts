import { type MantineColorScheme } from '@mantine/core'
import { toast } from 'react-toastify'
import { APIError, InvalidRequest, NetworkError, NotFound, Unauthenticated, Unauthorized } from '@/src/api/error'
import { signIn } from 'next-auth/react'

// errorHandler is a helper function that wraps a block of code in a try-catch block and handles common API errors.
// It displays a toast with an error message.
// The colorScheme parameter is used to determine the color of the toast.
// The onRetry parameter is a callback that is called when the user closes the toast.
export const errorHandler = async (
  guardedBlock: () => Promise<void>,
  colorScheme: MantineColorScheme,
  onRetry?: () => void
): Promise<void> => {
  try {
    await guardedBlock()
  } catch (error) {
    let message = 'An error occurred. Please try again later.'
    if (error instanceof InvalidRequest) {
      message = 'The entered data is invalid. Please try again.'
    } else if (error instanceof Unauthenticated) {
      message = 'Your session has expired. Please log in again.'
      void signIn('keycloak')
    } else if (error instanceof Unauthorized) {
      message = 'You are not allowed to do that.'
    } else if (error instanceof NotFound) {
      message = 'The requested resource was not found.'
    } else if (error instanceof NetworkError) {
      message = 'A network error occurred. Please check your connection and try again.'
    }

    if (!(error instanceof APIError)) {
      console.error('Unknown error occurred', error)
    }

    toast.error(message, {
      theme: colorScheme,
      onClose: onRetry
    })
  }
}
