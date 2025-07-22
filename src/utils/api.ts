import axios from 'axios'
import { ContentItem, APIResponse } from '../types'

const api = axios.create({
  timeout: 10000,
})

// Environment variable validation - UPDATED for NewsData.io
const validateApiKeys = () => {
  if (!process.env.NEXT_PUBLIC_NEWSDATA_API_KEY) {
    console.warn('NewsData.io API key not found - news features may not work')
  }
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    console.warn('TMDB API key not found - movie features may not work')
  }
  if (!process.env.NEXT_PUBLIC_OMDB_API_KEY) {
    console.warn('OMDb API key not found - additional movie features may not work')
  }
}

validateApiKeys()

// Enhanced error handling - FIX: Replace 'any' with 'unknown'
const handleApiError = (error: unknown, apiType: string): { articles: ContentItem[]; hasMore: boolean; totalResults: number } => {
  console.error(`${apiType} API Error:`, error)
  
  // Type guard for error object
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 426) {
      console.warn(`${apiType} API blocked in production (status 426) - using fallback`)
    } else if (axiosError.response?.status === 429) {
      console.warn(`${apiType} API rate limit exceeded - using fallback`)
    } else if (axiosError.response?.status === 401) {
      console.warn(`Invalid ${apiType} API key - using fallback`)
    } else if (axiosError.response?.status && axiosError.response.status >= 500) {
      console.warn(`${apiType} service temporarily unavailable - using fallback`)
    }
  }
  
  // Return empty result instead of throwing
  return { articles: [], hasMore: false, totalResults: 0 }
}

// UPDATED: NewsData.io API Integration (Production-Ready)
export const newsAPI = {
  getNews: async (categories: string[], page: number = 1): Promise<APIResponse> => {
    try {
      const category = categories[0] || 'technology'
      
      // Map categories to NewsData.io supported categories
      const categoryMap: { [key: string]: string } = {
        'general': 'top',
        'business': 'business',
        'entertainment': 'entertainment',
        'health': 'health',
        'science': 'science',
        'sports': 'sports',
        'technology': 'technology'
      }
      
      const newsDataCategory = categoryMap[category] || 'technology'
      
      console.log(`Fetching news from NewsData.io: category=${newsDataCategory}, page=${page}`)
      
      const response = await api.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY,
          category: newsDataCategory,
          size: 10, // NewsData.io free tier limit
          language: 'en',
          country: 'us'
        }
      })

      console.log('NewsData.io response status:', response.data.status)

      if (response.data.status !== 'success') {
        console.warn('NewsData.io API returned non-success status:', response.data.status)
        return { articles: [], hasMore: false, totalResults: 0 }
      }

      const articles: ContentItem[] = response.data.results
        ?.filter((article: Record<string, unknown>) => 
          article.title && 
          article.title !== '[Removed]' && 
          article.source_id &&
          article.pubDate
        )
        ?.map((article: Record<string, unknown>, index: number) => ({
          id: `newsdata-${article.article_id || `${Date.now()}-${index}`}`,
          type: 'news' as const,
          title: String(article.title),
          description: String(article.description || article.content || 'Read more about this story from NewsData.io'),
          imageUrl: article.image_url ? String(article.image_url) : `https://picsum.photos/400/300?news=${index}`,
          url: String(article.link || '#'),
          category: category,
          publishedAt: String(article.pubDate),
          source: String(article.source_id || 'NewsData.io')
        })) || []

      console.log(`NewsData.io loaded ${articles.length} articles successfully`)

      return {
        articles,
        hasMore: false, // NewsData.io free tier doesn't support pagination
        totalResults: articles.length
      }
    } catch (error) {
      console.error('NewsData.io API failed:', error)
      return handleApiError(error, 'NewsData.io')
    }
  },

  searchNews: async (query: string, categories: string[] = [], page: number = 1): Promise<APIResponse> => {
    try {
      console.log(`Searching NewsData.io for: "${query}"`)
      
      const response = await api.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY,
          q: query,
          size: 10,
          language: 'en'
        }
      })

      if (response.data.status !== 'success') {
        return { articles: [], hasMore: false, totalResults: 0 }
      }

      const articles: ContentItem[] = response.data.results
        ?.filter((article: Record<string, unknown>) => 
          article.title && 
          article.source_id
        )
        ?.map((article: Record<string, unknown>, index: number) => ({
          id: `newsdata-search-${query.replace(/\s+/g, '-')}-${index}`,
          type: 'news' as const,
          title: String(article.title),
          description: String(article.description || `Search result for "${query}" from NewsData.io`),
          imageUrl: article.image_url ? String(article.image_url) : `https://picsum.photos/400/300?search=${index}`,
          url: String(article.link || '#'),
          category: categories[0] || 'general',
          publishedAt: String(article.pubDate),
          source: String(article.source_id || 'NewsData.io Search')
        })) || []

      console.log(`NewsData.io search found ${articles.length} articles for "${query}"`)

      return {
        articles,
        hasMore: false,
        totalResults: articles.length
      }
    } catch (error) {
      console.error('NewsData.io Search Error:', error)
      return handleApiError(error, 'NewsData.io Search')
    }
  }
}

// Enhanced TMDB Movie API Integration
export const movieAPI = {
  getTrendingMovies: async (page: number = 1): Promise<APIResponse> => {
    try {
      const response = await api.get('https://api.themoviedb.org/3/trending/movie/day', {
        params: {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          page,
          language: 'en-US'
        }
      })

      const articles: ContentItem[] = response.data.results?.map((movie: Record<string, unknown>) => ({
        id: `movie-${movie.id}`,
        type: 'movie' as const,
        title: String(movie.title),
        description: String(movie.overview),
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        category: 'entertainment',
        publishedAt: String(movie.release_date),
        source: 'The Movie Database'
      })) || []

      return {
        articles,
        hasMore: page < (response.data.total_pages || 1) && page < 10,
        totalResults: Math.min(response.data.total_results || 0, 200)
      }
    } catch (error) {
      return handleApiError(error, 'TMDB')
    }
  },

  searchMovies: async (query: string, page: number = 1): Promise<APIResponse> => {
    try {
      const response = await api.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          query,
          page,
          language: 'en-US'
        }
      })

      const articles: ContentItem[] = response.data.results?.map((movie: Record<string, unknown>) => ({
        id: `search-movie-${movie.id}`,
        type: 'movie' as const,
        title: String(movie.title),
        description: String(movie.overview),
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        category: 'entertainment',
        publishedAt: String(movie.release_date),
        source: 'TMDB Search'
      })) || []

      return {
        articles,
        hasMore: page < (response.data.total_pages || 1) && page < 5,
        totalResults: response.data.total_results || 0
      }
    } catch (error) {
      return handleApiError(error, 'TMDB Search')
    }
  },

  getMoviesByCategory: async (genre: string, page: number = 1): Promise<APIResponse> => {
    try {
      const genreMap: { [key: string]: number } = {
        'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35,
        'crime': 80, 'documentary': 99, 'drama': 18, 'family': 10751,
        'fantasy': 14, 'horror': 27, 'music': 10402, 'mystery': 9648,
        'romance': 10749, 'science-fiction': 878, 'thriller': 53,
        'war': 10752, 'western': 37
      }

      const genreId = genreMap[genre.toLowerCase()] || 28

      const response = await api.get('https://api.themoviedb.org/3/discover/movie', {
        params: {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          with_genres: genreId,
          page,
          language: 'en-US',
          sort_by: 'popularity.desc'
        }
      })

      const articles: ContentItem[] = response.data.results?.map((movie: Record<string, unknown>) => ({
        id: `genre-movie-${movie.id}`,
        type: 'movie' as const,
        title: String(movie.title),
        description: String(movie.overview),
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        category: 'entertainment',
        publishedAt: String(movie.release_date),
        source: 'TMDB Genre'
      })) || []

      return {
        articles,
        hasMore: page < (response.data.total_pages || 1) && page < 5,
        totalResults: response.data.total_results || 0
      }
    } catch (error) {
      return handleApiError(error, 'TMDB Genre')
    }
  }
}

// OMDb API Integration - Enhanced for trending content
export const omdbAPI = {
  searchMovies: async (query: string, page: number = 1): Promise<APIResponse> => {
    try {
      const response = await api.get('http://www.omdbapi.com/', {
        params: {
          apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
          s: query,
          page: page,
          type: 'movie'
        }
      })

      if (response.data.Response === 'False') {
        return { articles: [], hasMore: false, totalResults: 0 }
      }

      const articles: ContentItem[] = response.data.Search?.map((movie: Record<string, unknown>, index: number) => ({
        id: `omdb-${movie.imdbID || `${query}-${page}-${index}`}`,
        type: 'movie' as const,
        title: String(movie.Title),
        description: `${movie.Year} ${movie.Type} - IMDb ID: ${movie.imdbID}`,
        imageUrl: movie.Poster && movie.Poster !== 'N/A' ? String(movie.Poster) : undefined,
        url: `https://www.imdb.com/title/${movie.imdbID}`,
        category: 'entertainment',
        publishedAt: String(movie.Year),
        source: 'OMDb Database'
      })) || []

      return {
        articles,
        hasMore: parseInt(response.data.totalResults) > page * 10,
        totalResults: parseInt(response.data.totalResults) || 0
      }
    } catch (error) {
      return handleApiError(error, 'OMDb')
    }
  },

  // NEW: Get popular movies for trending content
  getTrendingMovies: async (page: number = 1): Promise<APIResponse> => {
    try {
      // Use popular movie titles for OMDb trending
      const popularMovieQueries = ['Avengers', 'Batman', 'Spider', 'Star Wars', 'Marvel', 'Fast', 'John Wick', 'Mission']
      const randomQuery = popularMovieQueries[Math.floor(Math.random() * popularMovieQueries.length)]
      
      console.log(`Fetching trending movies from OMDb with query: ${randomQuery}`)
      
      const response = await api.get('http://www.omdbapi.com/', {
        params: {
          apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
          s: randomQuery,
          type: 'movie',
          page: 1
        }
      })

      if (response.data.Response === 'False') {
        return { articles: [], hasMore: false, totalResults: 0 }
      }

      const articles: ContentItem[] = response.data.Search?.slice(0, 5).map((movie: Record<string, unknown>, index: number) => ({
        id: `omdb-trending-${movie.imdbID || `${randomQuery}-${index}`}`,
        type: 'movie' as const,
        title: String(movie.Title),
        description: `${movie.Year} ${movie.Type} - Popular on IMDb`,
        imageUrl: movie.Poster && movie.Poster !== 'N/A' ? String(movie.Poster) : undefined,
        url: `https://www.imdb.com/title/${movie.imdbID}`,
        category: 'entertainment',
        publishedAt: String(movie.Year),
        source: 'OMDb Trending'
      })) || []

      return {
        articles,
        hasMore: false,
        totalResults: articles.length
      }
    } catch (error) {
      return handleApiError(error, 'OMDb Trending')
    }
  }
}

// Enhanced Mock Social Media API (UNCHANGED - Working perfectly)
export const socialAPI = {
  getSocialPosts: async (hashtags: string[], page: number = 1): Promise<APIResponse> => {
    // Simulate realistic network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
    
    // Simulate occasional errors (2% chance)
    if (Math.random() < 0.02) {
      return { articles: [], hasMore: false, totalResults: 0 }
    }

    const currentCategory = hashtags[0] || 'technology'
    const socialPlatforms = ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok']
    const postTypes = [
      '🔥 Hot take', '💡 Insight', '🎯 Update', '📊 Analysis', '🚀 News',
      '💭 Opinion', '🎉 Celebration', '🔍 Deep dive', '⚡ Breaking', '🎪 Trending'
    ]

    const mockPosts: ContentItem[] = Array.from({ length: 12 }, (_, index) => {
      const platform = socialPlatforms[Math.floor(Math.random() * socialPlatforms.length)]
      const postType = postTypes[Math.floor(Math.random() * postTypes.length)]
      const engagement = Math.floor(Math.random() * 5000) + 100
      const comments = Math.floor(Math.random() * 500) + 10

      return {
        id: `social-${currentCategory}-${page}-${index}`,
        type: 'social' as const,
        title: `${postType}: ${currentCategory} is revolutionizing the industry`,
        description: `Engaging discussion about ${currentCategory} with ${engagement} likes, ${comments} comments and growing engagement. Community insights and expert opinions on the latest developments in ${currentCategory}. Join the conversation!`,
        imageUrl: `https://picsum.photos/400/400?social=${page * 10 + index}`,
        url: '#',
        category: currentCategory,
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        source: platform
      }
    })

    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      articles: mockPosts.slice(startIndex, endIndex),
      hasMore: page < 5,
      totalResults: 50
    }
  },

  searchSocialPosts: async (query: string, hashtags: string[] = [], page: number = 1): Promise<APIResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 400))
    
    if (Math.random() < 0.01) {
      return { articles: [], hasMore: false, totalResults: 0 }
    }

    const currentCategory = hashtags[0] || query
    const socialPlatforms = ['Twitter', 'Instagram', 'LinkedIn']
    
    const mockSearchPosts: ContentItem[] = Array.from({ length: 8 }, (_, index) => {
      const platform = socialPlatforms[Math.floor(Math.random() * socialPlatforms.length)]
      const engagement = Math.floor(Math.random() * 2000) + 50

      return {
        id: `social-search-${query}-${page}-${index}`,
        type: 'social' as const,
        title: `Search result: ${query} discussion trending now`,
        description: `Found relevant content about "${query}" with ${engagement} interactions. This post matches your search criteria and includes valuable insights from the community.`,
        imageUrl: `https://picsum.photos/400/400?search=${query}${index}`,
        url: '#',
        category: currentCategory,
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        source: `${platform} Search`
      }
    })

    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      articles: mockSearchPosts.slice(startIndex, endIndex),
      hasMore: page < 3,
      totalResults: 25
    }
  }
}

// UPDATED: Unified Content API using BOTH movie APIs
export const contentAPI = {
  getAllContent: async (categories: string[], page: number = 1, contentTypes: string[] = ['news', 'movie', 'social']): Promise<APIResponse> => {
    try {
      const promises: Promise<APIResponse>[] = []
      
      // Add news API call
      if (contentTypes.includes('news') && categories.length > 0) {
        promises.push(
          newsAPI.getNews(categories, page).catch(error => {
            console.warn('NewsData.io failed, continuing without news:', error.message)
            return { articles: [], hasMore: false, totalResults: 0 }
          })
        )
      }
      
      // Add BOTH movie APIs for comprehensive coverage
      if (contentTypes.includes('movie')) {
        // TMDB trending movies
        promises.push(
          movieAPI.getTrendingMovies(page).catch(error => {
            console.warn('TMDB failed, continuing without TMDB movies:', error.message)
            return { articles: [], hasMore: false, totalResults: 0 }
          })
        )
        
        // OMDb trending movies
        promises.push(
          omdbAPI.getTrendingMovies(page).catch(error => {
            console.warn('OMDb failed, continuing without OMDb movies:', error.message)
            return { articles: [], hasMore: false, totalResults: 0 }
          })
        )
      }
      
      // Add social API call
      if (contentTypes.includes('social')) {
        promises.push(
          socialAPI.getSocialPosts(categories, page).catch(error => {
            console.warn('Social API failed, continuing without social:', error.message)
            return { articles: [], hasMore: false, totalResults: 0 }
          })
        )
      }

      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled(promises)
      
      // Extract successful responses
      const successfulResponses = results
        .filter((result): result is PromiseFulfilledResult<APIResponse> => 
          result.status === 'fulfilled' && result.value.articles.length > 0
        )
        .map(result => result.value)

      console.log(`Content API: ${successfulResponses.length}/${promises.length} sources loaded successfully`)

      // If no successful responses, return empty but don't throw
      if (successfulResponses.length === 0) {
        console.warn('All content APIs failed, returning empty feed')
        return { articles: [], hasMore: false, totalResults: 0 }
      }

      const allArticles = successfulResponses.flatMap(response => response.articles)
      
      // Sort by publication date (newest first)
      const sortedArticles = allArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )

      return {
        articles: sortedArticles,
        hasMore: successfulResponses.some(response => response.hasMore),
        totalResults: successfulResponses.reduce((sum, response) => sum + response.totalResults, 0)
      }
    } catch (error) {
      console.error('Content API Error:', error)
      // Return empty instead of throwing to prevent app crash
      return { articles: [], hasMore: false, totalResults: 0 }
    }
  },

  searchAllContent: async (query: string, categories: string[] = [], page: number = 1): Promise<APIResponse> => {
    try {
      const promises: Promise<APIResponse>[] = []
      
      // Search across ALL content types including BOTH movie APIs
      promises.push(
        newsAPI.searchNews(query, categories, page).catch(() => ({ articles: [], hasMore: false, totalResults: 0 }))
      )
      promises.push(
        movieAPI.searchMovies(query, page).catch(() => ({ articles: [], hasMore: false, totalResults: 0 }))
      )
      promises.push(
        omdbAPI.searchMovies(query, page).catch(() => ({ articles: [], hasMore: false, totalResults: 0 }))
      )
      promises.push(
        socialAPI.searchSocialPosts(query, categories, page).catch(() => ({ articles: [], hasMore: false, totalResults: 0 }))
      )

      const results = await Promise.allSettled(promises)
      const successfulResponses = results
        .filter((result): result is PromiseFulfilledResult<APIResponse> => 
          result.status === 'fulfilled' && result.value.articles.length > 0
        )
        .map(result => result.value)

      const allArticles = successfulResponses.flatMap(response => response.articles)
      
      // Filter and sort search results
      const filteredArticles = allArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      )

      const sortedResults = filteredArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )

      console.log(`Search found ${sortedResults.length} total results from ${successfulResponses.length} sources`)

      return {
        articles: sortedResults,
        hasMore: successfulResponses.some(response => response.hasMore) && page < 3,
        totalResults: filteredArticles.length
      }
    } catch (error) {
      console.error('Search API Error:', error)
      return { articles: [], hasMore: false, totalResults: 0 }
    }
  }
}

// Export individual APIs for specific use cases
export { api as axiosInstance }

// Default export for main content fetching
export default contentAPI
