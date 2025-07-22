// src/utils/apiErrorHandler.ts

interface ErrorResponse {
  response?: {
    status?: number
    data?: unknown
  }
  message?: string
  code?: string
}

export const handleAPIError = (error: unknown, apiType: string) => {
  console.error(`${apiType} API Error:`, error)
  
  // Type guard to check if error has response property
  const errorWithResponse = error as ErrorResponse
  
  if (errorWithResponse?.response?.status === 429) {
    throw new Error(`${apiType} API rate limit exceeded. Please try again later.`)
  } else if (errorWithResponse?.response?.status === 401) {
    throw new Error(`${apiType} API authentication failed. Check your API key.`)
  } else if (errorWithResponse?.response?.status && errorWithResponse.response.status >= 500) {
    throw new Error(`${apiType} service is temporarily unavailable.`)
  } else {
    throw new Error(`Failed to fetch ${apiType.toLowerCase()} data. Please try again.`)
  }
}

// Alternative export with proper error handling
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export default handleAPIError
