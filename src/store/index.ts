import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import searchSlice from './slices/searchSlice'

// Import slices (we'll create these next)
import userPreferencesSlice from './slices/userPreferencesSlice'
import contentSlice from './slices/contentSlice'
import uiSlice from './slices/uiSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userPreferences', 'ui'] // Persist user preferences and UI settings
}

const rootReducer = combineReducers({
  userPreferences: userPreferencesSlice,
  content: contentSlice,
  ui: uiSlice,
  search : searchSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
