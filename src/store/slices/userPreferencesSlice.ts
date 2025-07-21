import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { reorderContent } from './contentSlice'

interface UserPreferences {
  categories: string[]
  favoriteContent: string[]
  language: string
  notificationSettings: {
    news: boolean
    recommendations: boolean
    social: boolean
  }
}

const initialState: UserPreferences = {
  categories: ['technology', 'sports'],
  favoriteContent: [],
  language: 'en',
  notificationSettings: {
    news: true,
    recommendations: true,
    social: true
  }
}

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    updateCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favoriteContent.includes(action.payload)) {
        state.favoriteContent.push(action.payload)
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favoriteContent = state.favoriteContent.filter(
        id => id !== action.payload
      )
    },
    updateLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<UserPreferences['notificationSettings']>>) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload }
    },
    reorderFavorites: (state, action: PayloadAction<string[]>) => {
      state.favoriteContent = action.payload
    }
  }
})






export const {
  updateCategories,
  addToFavorites,
  removeFromFavorites,
  updateLanguage,
  updateNotificationSettings,
  reorderFavorites
} = userPreferencesSlice.actions

export default userPreferencesSlice.reducer;
