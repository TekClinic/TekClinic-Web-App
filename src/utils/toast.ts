import { Bounce, type ToastOptions } from 'react-toastify'

// getToastOptions returns the toast options based on the color scheme.
export const getToastOptions = (colorScheme: string): ToastOptions => {
  return {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: colorScheme === 'light' ? 'light' : 'dark',
    transition: Bounce
  }
}
