import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { newsAPI, movieAPI, socialAPI } from '../../utils/api'



export interface ContentItem {
  id: string
  type: 'news' | 'movie' | 'social'
  title: string
  description: string
  imageUrl?: string
  url?: string
  category: string
  publishedAt: string
  source: string
}

interface ContentState {
  feed: ContentItem[]
  trending: ContentItem[]
  favorites: ContentItem[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

const initialState: ContentState = {
  feed: [],
  trending: [],
  favorites: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1
}

// Async thunk for fetching content
// src/store/slices/contentSlice.ts


// Enhanced fetchContent thunk
export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async ({ 
    categories, 
    page = 1, 
    contentTypes = ['news', 'movie', 'social'],
    searchQuery = ''
  }: { 
    categories: string[]
    page?: number
    contentTypes?: string[]
    searchQuery?: string
  }) => {
    try {
      const promises = []
      
      // Handle search across different content types
      if (searchQuery.trim()) {
        if (contentTypes.includes('movie')) {
          promises.push(movieAPI.searchMovies(searchQuery, page))
        }
        // For news search, you could implement newsAPI search
        // For social search, filter mock data
      } else {
        // Regular content fetching
        if (contentTypes.includes('news') && categories.length > 0) {
          promises.push(newsAPI.getNews(categories, page))
        }
        
        if (contentTypes.includes('movie')) {
          promises.push(movieAPI.getTrendingMovies(page))
        }
        
        if (contentTypes.includes('social')) {
          promises.push(socialAPI.getSocialPosts(categories, page))
        }
      }

      const responses = await Promise.all(promises)
      
      // Combine all articles from different sources
      const allArticles = responses.flatMap(response => response.articles)
      
      // Sort by publication date (newest first)
      const sortedArticles = allArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )

      return {
        articles: sortedArticles,
        hasMore: responses.some(response => response.hasMore),
        totalResults: responses.reduce((sum, response) => sum + response.totalResults, 0)
      }
    } catch (error) {
      throw error
    }
  }
)

// Add search-specific thunk
export const searchContent = createAsyncThunk(
  'content/searchContent',
  async ({ query, categories = [], page = 1 }: { 
    query: string
    categories?: string[]
    page?: number 
  }) => {
    const promises = []
    
    // Search movies via TMDB
    promises.push(movieAPI.searchMovies(query, page))
    
    // For news search, you could implement a search endpoint
    // For now, we'll use regular news API with categories
    if (categories.length > 0) {
      promises.push(newsAPI.getNews(categories, page))
    }
    
    // Filter social mock data based on search query
    const socialResults = await socialAPI.getSocialPosts([query], page)
    const filteredSocial = {
      ...socialResults,
      articles: socialResults.articles.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase())
      )
    }
    promises.push(Promise.resolve(filteredSocial))

    const responses = await Promise.all(promises)
    const allArticles = responses.flatMap(response => response.articles)
    
    // Filter all results by search query
    const searchResults = allArticles.filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.description.toLowerCase().includes(query.toLowerCase())
    )

    return {
      articles: searchResults,
      hasMore: responses.some(response => response.hasMore),
      totalResults: searchResults.length
    }
  }
)


const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    reorderContent: (state, action: PayloadAction<ContentItem[]>) => {
      state.feed = action.payload
    },
    clearContent: (state) => {
      state.feed = []
      state.page = 1
      state.hasMore = true
    },
    setFavorites: (state, action: PayloadAction<ContentItem[]>) => {
      state.favorites = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false
        if (action.meta.arg.page === 1) {
          state.feed = action.payload.articles || []
        } else {
          state.feed.push(...(action.payload.articles || []))
        }
        state.page = action.meta.arg.page || 1
        state.hasMore = action.payload.hasMore
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch content'
      })
  }
})

export const { reorderContent, clearContent, setFavorites } = contentSlice.actions
export default contentSlice.reducer;
