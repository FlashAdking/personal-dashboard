import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import FavoritesSection from '../../components/dashboard/FavoritesSection'
import userPreferencesSlice from '../../store/slices/userPreferencesSlice'
import contentSlice from '../../store/slices/contentSlice'

// Mock @dnd-kit for both FavoritesSection and ContentCard
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
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
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  rectSortingStrategy: jest.fn(),
  arrayMove: (array: any[], oldIndex: number, newIndex: number) => array,
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

const createMockStore = (initialState = {}) => {
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
        }
      },
      content: {
        feed: [],
        loading: false,
        error: null,
        hasMore: true,
        page: 1
      },
      ...initialState
    }
  })
}

describe('FavoritesSection Component', () => {
  test('shows empty state when no favorites', () => {
    const store = createMockStore({
      userPreferences: { 
        categories: ['technology'],
        favoriteContent: [],
        language: 'en',
        notificationSettings: { news: true, recommendations: true, social: true }
      },
      content: { 
        feed: [],
        loading: false,
        error: null,
        hasMore: true,
        page: 1
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
    const store = createMockStore({
      userPreferences: { 
        categories: ['technology'],
        favoriteContent: ['test-1'],
        language: 'en',
        notificationSettings: { news: true, recommendations: true, social: true }
      },
      content: { 
        feed: [
          {
            id: 'test-1',
            type: 'news',
            title: 'Favorite Article',
            description: 'Test description',
            category: 'technology',
            publishedAt: '2025-01-01',
            source: 'Test Source'
          }
        ],
        loading: false,
        error: null,
        hasMore: true,
        page: 1
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
})
