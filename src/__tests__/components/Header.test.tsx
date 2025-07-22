import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../../components/dashboard/Header'
import uiSlice from '../../store/slices/uiSlice'
import userPreferencesSlice from '../../store/slices/userPreferencesSlice'

const createMockStore = () => {
  return configureStore({
    reducer: { 
      ui: uiSlice,
      userPreferences: userPreferencesSlice
    },
    preloadedState: {
      ui: {
        darkMode: false,
        sidebarOpen: true,
        activeSection: 'feed',
        searchQuery: '',
        searchActive: false
      },
      userPreferences: {
        categories: ['technology'],
        favoriteContent: [],
        language: 'en',
        notificationSettings: {
          news: true,
          recommendations: true,
          social: true
        }
      }
    }
  })
}

describe('Header Component', () => {
  test('renders search input correctly', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  test('toggles dark mode when clicked', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
    
    const themeButton = screen.getByTestId('theme-toggle')
    fireEvent.click(themeButton)
    
    const state = store.getState()
    expect(state.ui.darkMode).toBe(true)
  })
})
