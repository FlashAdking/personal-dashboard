import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  activeSection: 'feed' | 'trending' | 'favorites'
  searchQuery: string
  searchActive: boolean
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  activeSection: 'feed',
  searchQuery: '',
  searchActive: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setActiveSection: (state, action: PayloadAction<UIState['activeSection']>) => {
      state.activeSection = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSearchActive: (state, action: PayloadAction<boolean>) => {
      state.searchActive = action.payload
    }
  }
})

export const { 
  toggleDarkMode, 
  toggleSidebar, 
  setActiveSection, 
  setSearchQuery, 
  setSearchActive 
} = uiSlice.actions

export default uiSlice.reducer
