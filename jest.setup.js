

import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_NEWS_API_KEY = '8ce7715ffea04470812e788e1d32b6e0'
process.env.NEXT_PUBLIC_TMDB_API_KEY = '07273d317131fb16377c0296edbf93e7'

// Mock console methods to reduce noise
const originalWarn = console.warn
const originalError = console.error

console.warn = (...args) => {
  if (args[0] && args[0].includes('API key not found')) {
    return
  }
  originalWarn.apply(console, args)
}

console.error = (...args) => {
  if (args[0] && args[0].includes('API Error')) {
    return
  }
  originalError.apply(console, args)
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
})
