/*
    This file contains utility functions that are used across the application.
 */

// Function to require a build environment variable to be set.
export const requireBuildEnv = (name: string, value?: string): string => {
  if (value == null) {
    throw new Error(`Missing required environment variable ${name}.
         You probably forgot to set it in your .env.local file.`)
  }
  return value
}
