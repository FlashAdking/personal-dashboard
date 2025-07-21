
import { ContentItem, APIResponse } from '../types'


export const mockNewsData = {
  technology: [
    {
      title: "AI Revolution Transforms Software Development in 2025",
      description: "Artificial Intelligence continues to reshape how developers write, test, and deploy code with unprecedented efficiency.",
      imageUrl: "https://picsum.photos/400/300?tech=1",
      category: "technology",
      source: "Tech Today"
    },
    {
      title: "Quantum Computing Breakthrough Announced by Major Tech Giants",
      description: "Leading technology companies announce significant advances in quantum computing that could revolutionize data processing.",
      imageUrl: "https://picsum.photos/400/300?tech=2", 
      category: "technology",
      source: "Innovation Weekly"
    }
  ],
  sports: [
    {
      title: "World Championship Finals Set New Attendance Records",
      description: "The upcoming championship finals have already broken ticket sales records with millions of fans expected to attend.",
      imageUrl: "https://picsum.photos/400/300?sports=1",
      category: "sports", 
      source: "Sports Central"
    },
    {
      title: "Olympic Training Facilities Unveil Advanced Technologies",
      description: "State-of-the-art training facilities now incorporate AI and VR technologies to enhance athlete performance.",
      imageUrl: "https://picsum.photos/400/300?sports=2",
      category: "sports",
      source: "Athletic News"
    }
  ],
  business: [
    {
      title: "Global Markets Show Strong Growth Despite Economic Challenges",
      description: "International financial markets demonstrate resilience with steady growth across multiple sectors.",
      imageUrl: "https://picsum.photos/400/300?business=1",
      category: "business",
      source: "Financial Times"
    }
  ]
}

export const mockMovieData = [
  {
    title: "Galactic Odyssey: The Final Frontier",
    description: "An epic space adventure that explores the mysteries of distant galaxies with stunning visual effects and compelling storytelling.",
    imageUrl: "https://picsum.photos/400/600?movie=space",
    rating: 8.7,
    releaseDate: "2024-12-01",
    genre: "Sci-Fi"
  },
  {
    title: "Chronicles of the Ancient Kingdom",
    description: "A historical epic that brings medieval legends to life with authentic storytelling and breathtaking cinematography.",
    imageUrl: "https://picsum.photos/400/600?movie=historical",
    rating: 9.1,
    releaseDate: "2024-11-15", 
    genre: "Historical Drama"
  },
  {
    title: "Digital Rebellion",
    description: "A cyberpunk thriller exploring the intersection of technology and humanity in a not-so-distant future.",
    imageUrl: "https://picsum.photos/400/600?movie=cyber",
    rating: 8.3,
    releaseDate: "2025-01-10",
    genre: "Thriller"
  }
]

// Simulate realistic API delays
const simulateNetworkDelay = (minMs: number = 500, maxMs: number = 1500): Promise<void> => {
  const delay = Math.random() * (maxMs - minMs) + minMs
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Simulate occasional network errors (5% chance)
const simulateError = (errorRate: number = 0.05): boolean => {
  return Math.random() < errorRate
}

// Mock News API
export const mockNewsAPI = {
  getNews: async (categories: string[], page: number = 1): Promise<APIResponse> => {
    await simulateNetworkDelay()
    
    if (simulateError()) {
      throw new Error('Failed to fetch news data - network error')
    }

    const allArticles = categories.flatMap(category => {
      const categoryData = mockNewsData[category as keyof typeof mockNewsData] || []
      return categoryData.map((article, index) => ({
        id: `news-${category}-${page}-${index}`,
        type: 'news' as const,
        title: article.title,
        description: article.description,
        imageUrl: article.imageUrl,
        url: '#',
        category: article.category,
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        source: article.source
      }))
    })

    // Add some randomization to simulate fresh content
    const shuffledArticles = allArticles.sort(() => Math.random() - 0.5)
    
    // Simulate pagination
    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedArticles = shuffledArticles.slice(startIndex, endIndex)

    return {
      articles: paginatedArticles,
      hasMore: endIndex < shuffledArticles.length,
      totalResults: shuffledArticles.length
    }
  }
}

// Mock Movie API  
export const mockMovieAPI = {
  getTrendingMovies: async (page: number = 1): Promise<APIResponse> => {
    await simulateNetworkDelay()
    
    if (simulateError()) {
      throw new Error('Failed to fetch movie data - service unavailable')
    }

    const moviesWithIds = mockMovieData.map((movie, index) => ({
      id: `movie-${page}-${index}`,
      type: 'movie' as const,
      title: movie.title,
      description: movie.description,
      imageUrl: movie.imageUrl,
      url: '#',
      category: 'entertainment',
      publishedAt: movie.releaseDate,
      source: 'Movie Database'
    }))

    const itemsPerPage = 8
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    
    return {
      articles: moviesWithIds.slice(startIndex, endIndex),
      hasMore: endIndex < moviesWithIds.length * 3, // Simulate more pages
      totalResults: mockMovieData.length * 3
    }
  }
}

// Mock Social Media API
export const mockSocialAPI = {
  getSocialPosts: async (hashtags: string[], page: number = 1): Promise<APIResponse> => {
    await simulateNetworkDelay(300, 800) // Faster for social content
    
    if (simulateError(0.03)) { // Lower error rate for social
      throw new Error('Social media service temporarily unavailable')
    }

    const mockPosts: ContentItem[] = Array.from({ length: 12 }, (_, index) => {
      const hashtag = hashtags[0] || 'technology'
      const postTypes = ['photo', 'video', 'text', 'link']
      const postType = postTypes[Math.floor(Math.random() * postTypes.length)]
      
      return {
        id: `social-${page}-${index}`,
        type: 'social',
        title: `${postType === 'photo' ? '📸' : postType === 'video' ? '🎥' : postType === 'link' ? '🔗' : '💭'} Trending ${hashtag} discussion`,
        description: `Engaging social media content about ${hashtag}. This ${postType} post is generating buzz in the community with insightful discussions and user interactions.`,
        imageUrl: `https://picsum.photos/400/400?social=${page + index}`,
        url: '#',
        category: hashtag,
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        source: `Social Platform`
      }
    })

    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      articles: mockPosts.slice(startIndex, endIndex),
      hasMore: page < 5, // Simulate 5 pages of social content
      totalResults: 50
    }
  }
}

// Unified search across all mock data
export const mockSearchAPI = {
  searchContent: async (query: string, categories: string[] = [], page: number = 1): Promise<APIResponse> => {
    await simulateNetworkDelay(200, 600) // Faster search response
    
    if (simulateError(0.02)) {
      throw new Error('Search service temporarily unavailable')
    }

    const allContent = [
      ...Object.values(mockNewsData).flat(),
      ...mockMovieData.map(movie => ({
        title: movie.title,
        description: movie.description,
        imageUrl: movie.imageUrl,
        category: 'entertainment',
        source: 'Movies'
      }))
    ]
    
    const filteredContent = allContent.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                          item.description.toLowerCase().includes(query.toLowerCase())
      
      const matchesCategory = categories.length === 0 || categories.includes(item.category)
      
      return matchesQuery && matchesCategory
    })
    
    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const paginatedResults = filteredContent.slice(startIndex, startIndex + itemsPerPage)
    
    return {
      articles: paginatedResults.map((item, index) => ({
        id: `search-${query}-${page}-${index}`,
        type: item.category === 'entertainment' ? 'movie' : 'news',
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        url: '#',
        category: item.category,
        publishedAt: new Date().toISOString(),
        source: item.source
      })),
      hasMore: startIndex + itemsPerPage < filteredContent.length,
      totalResults: filteredContent.length
    }
  }
}
