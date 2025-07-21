import axios from 'axios'
import { ContentItem, APIResponse } from '../types'

const api = axios.create({
  timeout: 10000,
})

// Environment variable validation
const validateApiKeys = () => {
  if (!process.env.NEXT_PUBLIC_NEWS_API_KEY) {
    console.warn('NewsAPI key not found - news features may not work')
  }
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    console.warn('TMDB API key not found - movie features may not work')
  }
}

validateApiKeys()

// Enhanced error handling
const handleApiError = (error: any, apiType: string) => {
  console.error(`${apiType} API Error:`, error)
  
  if (error.response?.status === 429) {
    throw new Error(`${apiType} API rate limit exceeded. Please try again later.`)
  } else if (error.response?.status === 401) {
    throw new Error(`Invalid ${apiType} API key. Please check your configuration.`)
  } else if (error.response?.status >= 500) {
    throw new Error(`${apiType} service is temporarily unavailable.`)
  } else if (error.code === 'ECONNABORTED') {
    throw new Error(`${apiType} request timeout. Please try again.`)
  } else {
    throw new Error(`Failed to fetch ${apiType.toLowerCase()} data`)
  }
}

// Real News API Integration
export const newsAPI = {
  getNews: async (categories: string[], page: number = 1): Promise<APIResponse> => {
    try {
      const category = categories[0] || 'general'
      const response = await api.get('https://newsapi.org/v2/top-headlines', {
        params: {
          apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY,
          category: category,
          page,
          pageSize: 20,
          country: 'us',
          language: 'en'
        }
      })

      const articles: ContentItem[] = response.data.articles
        .filter((article: any) => 
          article.title && 
          article.title !== '[Removed]' && 
          article.source?.name &&
          article.publishedAt
        )
        .map((article: any, index: number) => ({
          id: `news-${article.publishedAt}-${index}`,
          type: 'news',
          title: article.title,
          description: article.description || article.content || 'No description available',
          imageUrl: article.urlToImage,
          url: article.url,
          category: category,
          publishedAt: article.publishedAt,
          source: article.source.name
        }))

      return {
        articles,
        hasMore: response.data.articles.length === 20,
        totalResults: response.data.totalResults
      }
    } catch (error) {
      handleApiError(error, 'News')
      return { articles: [], hasMore: false, totalResults: 0 }
    }
  },

  searchNews: async (query: string, categories: string[] = [], page: number = 1): Promise<APIResponse> => {
    try {
      const response = await api.get('https://newsapi.org/v2/everything', {
        params: {
          apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY,
          q: query,
          category: categories.length > 0 ? categories[0] : undefined,
          page,
          pageSize: 20,
          language: 'en',
          sortBy: 'relevancy'
        }
      })

      const articles: ContentItem[] = response.data.articles
        .filter((article: any) => 
          article.title && 
          article.title !== '[Removed]' && 
          article.source?.name
        )
        .map((article: any, index: number) => ({
          id: `search-news-${query}-${page}-${index}`,
          type: 'news',
          title: article.title,
          description: article.description || 'No description available',
          imageUrl: article.urlToImage,
          url: article.url,
          category: categories[0] || 'general',
          publishedAt: article.publishedAt,
          source: article.source.name
        }))

      return {
        articles,
        hasMore: response.data.articles.length === 20,
        totalResults: response.data.totalResults
      }
    } catch (error) {
      handleApiError(error, 'News Search')
      return { articles: [], hasMore: false, totalResults: 0 }
    }
  }
}

// Real TMDB Movie API Integration
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

      const articles: ContentItem[] = response.data.results.map((movie: any) => ({
        id: `movie-${movie.id}`,
        type: 'movie',
        title: movie.title,
        description: movie.overview,
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        category: 'entertainment',
        publishedAt: movie.release_date,
        source: 'The Movie Database'
      }))

      return {
        articles,
        hasMore: page < response.data.total_pages && page < 10,
        totalResults: Math.min(response.data.total_results, 200)
      }
    } catch (error) {
      handleApiError(error, 'TMDB')
      return { articles: [], hasMore: false, totalResults: 0 }
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

      const articles: ContentItem[] = response.data.results.map((movie: any) => ({
        id: `search-movie-${movie.id}`,
        type: 'movie',
        title: movie.title,
        description: movie.overview,
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        category: 'entertainment',
        publishedAt: movie.release_date,
        source: 'TMDB Search'
      }))

      return {
        articles,
        hasMore: page < response.data.total_pages && page < 5,
        totalResults: response.data.total_results
      }
    } catch (error) {
      handleApiError(error, 'TMDB Search')
      return { articles: [], hasMore: false, totalResults: 0 }
    }
  },

  getMoviesByCategory: async (genre: string, page: number = 1): Promise<APIResponse> => {
    try {
      // Genre IDs mapping for TMDB
      const genreMap: { [key: string]: number } = {
        'action': 28,
        'adventure': 12,
        'animation': 16,
        'comedy': 35,
        'crime': 80,
        'documentary': 99,
        'drama': 18,
        'family': 10751,
        'fantasy': 14,
        'horror': 27,
        'music': 10402,
        'mystery': 9648,
        'romance': 10749,
        'science-fiction': 878,
        'thriller': 53,
        'war': 10752,
        'western': 37
      }

      const genreId = genreMap[genre.toLowerCase()] || 28 // Default to action

      const response = await api.get('https://api.themoviedb.org/3/discover/movie', {
        params: {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          with_genres: genreId,
          page,
          language: 'en-US',
          sort_by: 'popularity.desc'
        }
      })

      const articles: ContentItem[] = response.data.results.map((movie: any) => ({
        id: `genre-movie-${movie.id}`,
        type: 'movie',
        title: movie.title,
        description: movie.overview,
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        category: 'entertainment',
        publishedAt: movie.release_date,
        source: 'TMDB Genre'
      }))

      return {
        articles,
        hasMore: page < response.data.total_pages && page < 5,
        totalResults: response.data.total_results
      }
    } catch (error) {
      handleApiError(error, 'TMDB Genre')
      return { articles: [], hasMore: false, totalResults: 0 }
    }
  }
}

// Mock Social Media API (Enhanced)
export const socialAPI = {
  getSocialPosts: async (hashtags: string[], page: number = 1): Promise<APIResponse> => {
    // Simulate realistic network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
    
    // Simulate occasional errors (2% chance)
    if (Math.random() < 0.02) {
      throw new Error('Social media service temporarily unavailable')
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
        type: 'social',
        title: `${postType}: ${currentCategory} is revolutionizing the industry`,
        description: `Engaging discussion about ${currentCategory} with ${engagement} likes, ${comments} comments and growing engagement. Community insights and expert opinions on the latest developments in ${currentCategory}. Join the conversation!`,
        imageUrl: `https://picsum.photos/400/400?social=${page * 10 + index}`,
        url: '#',
        category: currentCategory,
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        source: platform
      }
    })

    // Simulate pagination
    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      articles: mockPosts.slice(startIndex, endIndex),
      hasMore: page < 5, // 5 pages of social content
      totalResults: 50
    }
  },

  searchSocialPosts: async (query: string, hashtags: string[] = [], page: number = 1): Promise<APIResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 400))
    
    if (Math.random() < 0.01) {
      throw new Error('Social search temporarily unavailable')
    }

    const currentCategory = hashtags[0] || query
    const socialPlatforms = ['Twitter', 'Instagram', 'LinkedIn']
    
    const mockSearchPosts: ContentItem[] = Array.from({ length: 8 }, (_, index) => {
      const platform = socialPlatforms[Math.floor(Math.random() * socialPlatforms.length)]
      const engagement = Math.floor(Math.random() * 2000) + 50

      return {
        id: `social-search-${query}-${page}-${index}`,
        type: 'social',
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

// Unified Content API - Combines all sources
export const contentAPI = {
  getAllContent: async (categories: string[], page: number = 1, contentTypes: string[] = ['news', 'movie', 'social']): Promise<APIResponse> => {
    try {
      const promises = []
      
      if (contentTypes.includes('news') && categories.length > 0) {
        promises.push(newsAPI.getNews(categories, page))
      }
      
      if (contentTypes.includes('movie')) {
        promises.push(movieAPI.getTrendingMovies(page))
      }
      
      if (contentTypes.includes('social')) {
        promises.push(socialAPI.getSocialPosts(categories, page))
      }

      const responses = await Promise.all(promises)
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
      console.error('Content API Error:', error)
      throw new Error('Failed to fetch content')
    }
  },

  searchAllContent: async (query: string, categories: string[] = [], page: number = 1): Promise<APIResponse> => {
    try {
      const promises = []
      
      // Search across all content types
      promises.push(newsAPI.searchNews(query, categories, page))
      promises.push(movieAPI.searchMovies(query, page))
      promises.push(socialAPI.searchSocialPosts(query, categories, page))

      const responses = await Promise.all(promises)
      const allArticles = responses.flatMap(response => response.articles)
      
      // Filter and sort search results
      const filteredArticles = allArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      )

      const sortedResults = filteredArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )

      return {
        articles: sortedResults,
        hasMore: responses.some(response => response.hasMore) && page < 3,
        totalResults: filteredArticles.length
      }
    } catch (error) {
      console.error('Search API Error:', error)
      throw new Error('Failed to search content')
    }
  }
}

// Export individual APIs for specific use cases
export { api as axiosInstance }

// Default export for main content fetching
export default contentAPI
