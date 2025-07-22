import userPreferencesReducer, {
  updateCategories,
  addToFavorites,
  removeFromFavorites,
} from '../../store/slices/userPreferencesSlice'

describe('userPreferencesSlice', () => {
  const initialState = {
    categories: ['technology'],
    favoriteContent: [],
    language: 'en',
    notificationSettings: {
      news: true,
      recommendations: true,
      social: true
    }
  }

  test('should handle updateCategories', () => {
    const actual = userPreferencesReducer(
      initialState,
      updateCategories(['sports', 'business'])
    )
    expect(actual.categories).toEqual(['sports', 'business'])
  })

  test('should handle addToFavorites', () => {
    const actual = userPreferencesReducer(
      initialState,
      addToFavorites('test-article-1')
    )
    expect(actual.favoriteContent).toContain('test-article-1')
  })

  test('should handle removeFromFavorites', () => {
    const stateWithFavorites = {
      ...initialState,
      favoriteContent: ['article-1', 'article-2']
    }
    const actual = userPreferencesReducer(
      stateWithFavorites,
      removeFromFavorites('article-1')
    )
    expect(actual.favoriteContent).toEqual(['article-2'])
  })
})
