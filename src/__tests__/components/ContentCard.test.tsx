import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ContentCard from '../../components/content/ContentCard'
import userPreferencesSlice from '../../store/slices/userPreferencesSlice'
import { ContentItem } from '../../types'

// Mock @dnd-kit to avoid complex drag testing in unit tests
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

const mockContentItem: ContentItem = {
  id: 'test-news-1',
  type: 'news',
  title: 'Breaking: AI Revolution in Tech Industry',
  description: 'Artificial Intelligence continues to transform various sectors with breakthrough innovations.',
  imageUrl: 'https://example.com/tech-news.jpg',
  url: 'https://example.com/article/ai-revolution',
  category: 'technology',
  publishedAt: '2025-07-20T10:00:00Z',
  source: 'Tech Today'
}

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      userPreferences: userPreferencesSlice,
    },
    preloadedState: {
      userPreferences: {
        categories: ['technology', 'sports'],
        favoriteContent: [],
        language: 'en',
        notificationSettings: {
          news: true,
          recommendations: true,
          social: true
        }
      },
      ...initialState
    }
  })
}

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('ContentCard Component', () => {
  test('renders content card with all required elements', () => {
    renderWithProvider(<ContentCard item={mockContentItem} />)
    
    expect(screen.getByText('Breaking: AI Revolution in Tech Industry')).toBeInTheDocument()
    expect(screen.getByText(/Artificial Intelligence continues to transform/)).toBeInTheDocument()
    expect(screen.getByText('Tech Today')).toBeInTheDocument()
    expect(screen.getByText('technology')).toBeInTheDocument()
    expect(screen.getByText('News')).toBeInTheDocument()
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Read More →')).toBeInTheDocument()
  })

  test('handles favorite toggle functionality', () => {
    const store = createMockStore()
    renderWithProvider(<ContentCard item={mockContentItem} />, store)
    
    const favoriteButton = screen.getByTestId('favorite-button')
    expect(favoriteButton).toBeInTheDocument()
    
    fireEvent.click(favoriteButton)
    
    const state = store.getState()
    expect(state.userPreferences.favoriteContent).toContain('test-news-1')
  })
})
