// src/utils/apiErrorHandler.ts
export const handleAPIError = (error: any, apiType: string) => {
  console.error(`${apiType} API Error:`, error)
  
  if (error.response?.status === 429) {
    throw new Error(`${apiType} API rate limit exceeded. Please try again later.`)
  } else if (error.response?.status === 401) {
    throw new Error(`${apiType} API authentication failed. Check your API key.`)
  } else if (error.response?.status >= 500) {
    throw new Error(`${apiType} service is temporarily unavailable.`)
  } else {
    throw new Error(`Failed to fetch ${apiType.toLowerCase()} data. Please try again.`)
  }
}
