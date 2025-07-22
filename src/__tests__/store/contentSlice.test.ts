import contentReducer, { 
  fetchContent,
  reorderContent 
} from '../../store/slices/contentSlice'
import { ContentItem } from '../../types'

describe('contentSlice', () => {
  const initialState = {
    feed: [],
    trending: [],
    favorites: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1
  }

  const mockContentItems: ContentItem[] = [
    {
      id: 'news-1',
      type: 'news',
      title: 'Tech Innovation Breakthrough',
      description: 'Latest developments in artificial intelligence',
      imageUrl: 'https://example.com/tech.jpg',
      url: 'https://example.com/tech-news',
      category: 'technology',
      publishedAt: '2025-07-22T10:00:00Z',
      source: 'Tech Today'
    },
    {
      id: 'movie-1',
      type: 'movie',
      title: 'Blockbuster Movie 2025',
      description: 'Action-packed adventure film',
      imageUrl: 'https://example.com/movie.jpg',
      url: 'https://example.com/movie-details',
      category: 'entertainment',
      publishedAt: '2025-07-22T12:00:00Z',
      source: 'TMDB'
    }
  ]

  test('should return the initial state', () => {
    expect(contentReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  test('should handle reorderContent', () => {
    const stateWithContent = {
      ...initialState,
      feed: [...mockContentItems]
    }
    
    const reorderedItems = [mockContentItems[1], mockContentItems[0]]
    const actual = contentReducer(stateWithContent, reorderContent(reorderedItems))
    
    expect(actual.feed).toEqual(reorderedItems)
    expect(actual.feed[0].id).toBe('movie-1')
    expect(actual.feed[1].id).toBe('news-1')
  })

  test('should handle fetchContent pending', () => {
    const action = { type: fetchContent.pending.type }
    const actual = contentReducer(initialState, action)
    
    expect(actual.loading).toBe(true)
    expect(actual.error).toBe(null)
  })

  test('should handle fetchContent fulfilled', () => {
    const mockResponse = {
      articles: mockContentItems,
      hasMore: true,
      totalResults: 2
    }
    
    const action = {
      type: fetchContent.fulfilled.type,
      payload: mockResponse,
      meta: {
        arg: { categories: ['technology'], page: 1 }
      }
    }
    
    const actual = contentReducer(
      { ...initialState, loading: true }, 
      action
    )
    
    expect(actual.loading).toBe(false)
    expect(actual.feed).toEqual(mockContentItems)
    expect(actual.hasMore).toBe(true)
    expect(actual.error).toBe(null)
  })

  test('should handle pagination correctly', () => {
    const stateWithContent = {
      ...initialState,
      feed: [mockContentItems[0]],
      page: 1
    }
    
    const newContent = [mockContentItems[1]]
    const action = {
      type: fetchContent.fulfilled.type,
      payload: {
        articles: newContent,
        hasMore: false,
        totalResults: 2
      },
      meta: {
        arg: { categories: ['technology'], page: 2 }
      }
    }
    
    const actual = contentReducer(stateWithContent, action)
    
    expect(actual.feed).toHaveLength(2)
    expect(actual.hasMore).toBe(false)
  })
})
