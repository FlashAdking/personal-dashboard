import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { contentAPI } from '../../utils/api'
import { ContentItem } from '../../types'

interface SearchState {
  results: ContentItem[]
  loading: boolean
  error: string | null
  query: string
  hasMore: boolean
}

const initialState: SearchState = {
  results: [],
  loading: false,
  error: null,
  query: '',
  hasMore: false
}

export const performSearch = createAsyncThunk(
  'search/performSearch',
  async ({ query, categories = [], page = 1 }: { 
    query: string
    categories?: string[]
    page?: number 
  }) => {
    const response = await contentAPI.searchAllContent(query, categories, page)
    return { ...response, query }
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.results = []
      state.query = ''
      state.error = null
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload.articles
        state.query = action.payload.query
        state.hasMore = action.payload.hasMore
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Search failed'
      })
  }
})

export const { clearSearch, setQuery } = searchSlice.actions
export default searchSlice.reducer
