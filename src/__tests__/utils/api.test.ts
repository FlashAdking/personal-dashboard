import { socialAPI } from '../../utils/api'

// Mock console methods to suppress warnings in tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  
  // Mock Math.random to avoid random failures
  jest.spyOn(Math, 'random').mockReturnValue(0.5) // Always return 0.5 (never triggers the 2% error)
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('API Integration', () => {
  test('socialAPI generates mock posts correctly', async () => {
    const result = await socialAPI.getSocialPosts(['technology'], 1)
    
    expect(result.articles).toBeDefined()
    expect(result.articles.length).toBeGreaterThan(0)
    expect(result.articles[0].type).toBe('social')
    expect(result.hasMore).toBeDefined()
  })

  test('socialAPI handles different categories', async () => {
    const result1 = await socialAPI.getSocialPosts(['technology'], 1)
    const result2 = await socialAPI.getSocialPosts(['sports'], 1)
    
    expect(result1.articles[0].category).toBe('technology')
    expect(result2.articles[0].category).toBe('sports')
  })

  test('socialAPI supports pagination', async () => {
    const page1 = await socialAPI.getSocialPosts(['technology'], 1)
    const page2 = await socialAPI.getSocialPosts(['technology'], 2)
    
    expect(page1.articles).not.toEqual(page2.articles)
    expect(page1.hasMore).toBeDefined()
    expect(page2.hasMore).toBeDefined()
  })
})
