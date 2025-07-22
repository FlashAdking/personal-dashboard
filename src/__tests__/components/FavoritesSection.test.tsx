import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import FavoritesSection from '../../components/dashboard/FavoritesSection'
import userPreferencesSlice from '../../store/slices/userPreferencesSlice'
import contentSlice from '../../store/slices/contentSlice'

// Mock @dnd-kit with explicit React types
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCenter: jest.fn(),
}))

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  rectSortingStrategy: jest.fn(),
  arrayMove: (array: Array<unknown>, oldIndex: number, newIndex: number): Array<unknown> => {
    // Use all parameters to avoid warnings
    if (oldIndex === newIndex) return array
    const result = [...array]
    const [removed] = result.splice(oldIndex, 1)
    result.splice(newIndex, 0, removed)
    return result
  },
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: (): string => '',
    },
  },
}))

// Proper TypeScript interface for mock store state
interface ContentItem {
  id: string
  type: 'news' | 'movie' | 'social'
  title: string
  description: string
  category: string
  publishedAt: string
  source: string
  imageUrl?: string
  url?: string
}

interface MockStoreState {
  userPreferences?: {
    categories?: string[]
    favoriteContent?: string[]
    language?: string
    notificationSettings?: {
      news: boolean
      recommendations: boolean
      social: boolean
    }
  }
  content?: {
    feed?: ContentItem[]
    loading?: boolean
    error?: string | null
    hasMore?: boolean
    page?: number
  }
}

const createMockStore = (initialState: MockStoreState = {}) => {
  return configureStore({
    reducer: {
      userPreferences: userPreferencesSlice,
      content: contentSlice,
    },
    preloadedState: {
      userPreferences: {
        categories: ['technology'],
        favoriteContent: [],
        language: 'en',
        notificationSettings: {
          news: true,
          recommendations: true,
          social: true
        },
        ...initialState.userPreferences
      },
      content: {
        feed: [],
        loading: false,
        error: null,
        hasMore: true,
        page: 1,
        ...initialState.content
      }
    }
  })
}

describe('FavoritesSection Component', () => {
  beforeEach(() => {
    // Clear any console warnings/errors
    jest.clearAllMocks()
  })

  test('shows empty state when no favorites', () => {
    const store = createMockStore({
      userPreferences: { 
        favoriteContent: []
      },
      content: { 
        feed: []
      }
    })
    
    render(
      <Provider store={store}>
        <FavoritesSection />
      </Provider>
    )
    
    expect(screen.getByText('No favorites yet')).toBeInTheDocument()
  })

  test('displays favorite items with drag and drop', () => {
    const mockContentItem: ContentItem = {
      id: 'test-1',
      type: 'news',
      title: 'Favorite Article',
      description: 'Test description',
      category: 'technology',
      publishedAt: '2025-01-01',
      source: 'Test Source'
    }

    const store = createMockStore({
      userPreferences: { 
        favoriteContent: ['test-1']
      },
      content: { 
        feed: [mockContentItem]
      }
    })
    
    render(
      <Provider store={store}>
        <FavoritesSection />
      </Provider>
    )
    
    expect(screen.getByText('Your Favorites')).toBeInTheDocument()
    expect(screen.getByText('Favorite Article')).toBeInTheDocument()
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  test('handles empty favorites gracefully', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <FavoritesSection />
      </Provider>
    )
    
    // Should not crash and should show empty state
    expect(screen.getByText(/No favorites/i)).toBeInTheDocument()
  })
})
