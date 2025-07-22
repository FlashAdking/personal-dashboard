'use client'
import { useState } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { setActiveSection } from '../../store/slices/uiSlice'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  FireIcon,
  HeartIcon,
  NewspaperIcon,
  FilmIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Define the allowed section types
type SectionId = 'feed' | 'trending' | 'favorites'

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activeSection, sidebarOpen } = useAppSelector(state => state.ui)
  const { feed } = useAppSelector(state => state.content)
  const { favoriteContent } = useAppSelector(state => state.userPreferences)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Calculate content type counts from existing feed
  const contentCounts = {
    news: feed.filter(item => item.type === 'news').length,
    movies: feed.filter(item => item.type === 'movie').length,
    social: feed.filter(item => item.type === 'social').length,
    favorites: favoriteContent.length
  }

  const navigationItems: Array<{
    id: SectionId
    label: string
    icon: React.ComponentType<{ className?: string }>
    count: number | null
    description: string
  }> = [
    { 
      id: 'feed', 
      label: 'Your Feed', 
      icon: HomeIcon, 
      count: feed.length,
      description: 'Personalized content' 
    },
    { 
      id: 'trending', 
      label: 'Trending', 
      icon: FireIcon, 
      count: null,
      description: 'Popular content' 
    },
    { 
      id: 'favorites', 
      label: 'Favorites', 
      icon: HeartIcon, 
      count: contentCounts.favorites,
      description: 'Saved items' 
    }
  ]

  const contentTypeItems = [
    { 
      id: 'news', 
      label: 'News', 
      icon: NewspaperIcon, 
      count: contentCounts.news,
      color: 'text-blue-600 dark:text-blue-400' 
    },
    { 
      id: 'movies', 
      label: 'Movies', 
      icon: FilmIcon, 
      count: contentCounts.movies,
      color: 'text-purple-600 dark:text-purple-400' 
    },
    { 
      id: 'social', 
      label: 'Social', 
      icon: ChatBubbleLeftRightIcon, 
      count: contentCounts.social,
      color: 'text-green-600 dark:text-green-400' 
    }
  ]

  // Type-safe navigation handler
  const handleNavigation = (sectionId: SectionId) => {
    dispatch(setActiveSection(sectionId))
  }

  // Content type filter handler
  const handleContentTypeFilter = (contentType: string) => {
    // Always navigate to feed when filtering by content type
    dispatch(setActiveSection('feed' as const))
    console.log(`Content type filter applied: ${contentType}`)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => dispatch({ type: 'ui/setSidebarOpen', payload: false })}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : '-100%',
          opacity: sidebarOpen ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 z-30 w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 lg:static lg:translate-x-0 lg:opacity-100"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white lg:hidden xl:block">
                Content Hub
              </span>
            </div>
            <button
              onClick={() => dispatch({ type: 'ui/setSidebarOpen', payload: false })}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  
                  return (
                    <li key={item.id}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors group ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        data-testid={`nav-${item.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${
                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                          }`} />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== null && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isActive
                              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </motion.button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Content Types */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Content Types
              </h3>
              <ul className="space-y-2">
                {contentTypeItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <li key={item.id}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContentTypeFilter(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group hover:bg-gray-100 dark:hover:bg-gray-800"
                        data-testid={`filter-${item.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.label}
                          </span>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {item.count}
                        </span>
                      </motion.button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              data-testid="settings-button"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
              <span>Settings</span>
            </motion.button>
            
            {/* Use isSettingsOpen to prevent unused variable warning */}
            {isSettingsOpen && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                Settings panel functionality coming soon
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
