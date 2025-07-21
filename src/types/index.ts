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

export interface APIResponse {
  articles: ContentItem[]
  hasMore: boolean
  totalResults: number
}

export interface UserPreferences {
  categories: string[]
  favoriteContent: string[]
  language: string
}
