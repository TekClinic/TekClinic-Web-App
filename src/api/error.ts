import axios from 'axios'
import { StatusCodes } from 'http-status-codes'

// APIError is the base class for all errors that are thrown by the API
class APIError extends Error {
  readonly source: unknown

  constructor (message: string, source: unknown) {
    super(message)
    this.source = source
  }
}

// NotFound is thrown when the requested resource is not found.
class NotFound extends APIError {
}

// Unauthenticated is thrown when the user is not authenticated.
class Unauthenticated extends APIError {
}

// Unauthorized is thrown when the user is authenticated but not authorized to access the resource.
class Unauthorized extends APIError {
}

// InvalidRequest is thrown when the request is invalid.
class InvalidRequest extends APIError {
}

// InternalServerError is thrown when the server encounters an error.
class InternalServerError extends APIError {
}

// NetworkError is thrown when the network request fails.
class NetworkError extends APIError {
}

// UnknownError is thrown when the error is not recognized.
class UnknownError extends APIError {
  constructor (message: string, source: unknown) {
    super(message, source)
    console.error(source)
  }
}

// wrapError converts an unknown error to an APIError.
export const wrapError = (
  error: unknown
): APIError => {
  if (!axios.isAxiosError(error)) {
    return new UnknownError('Not an axios error', error)
  }
  const response = error.response
  if (response != null) {
    switch (response.status) {
      case StatusCodes.BAD_REQUEST:
        return new InvalidRequest(error.message, error)
      case StatusCodes.UNAUTHORIZED:
        return new Unauthenticated(error.message, error)
      case StatusCodes.FORBIDDEN:
        return new Unauthorized(error.message, error)
      case StatusCodes.NOT_FOUND:
        return new NotFound(error.message, error)
      case StatusCodes.INTERNAL_SERVER_ERROR:
        return new InternalServerError(error.message, error)
      default:
        return new UnknownError(error.message, error)
    }
  } else if (error.request != null) {
    return new NetworkError(error.message, error)
  }
  return new UnknownError('Unknown error', error)
}
