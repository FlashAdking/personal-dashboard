'use client'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { setActiveSection } from '../../store/slices/uiSlice'
import SettingsPanel from './SettingsPanel'
import {
  HomeIcon,
  FireIcon,
  HeartIcon,
  Cog6ToothIcon,
  NewspaperIcon,
  FilmIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activeSection, darkMode } = useAppSelector(state => state.ui)
  const { categories } = useAppSelector(state => state.userPreferences)

  const menuItems = [
    { id: 'feed', label: 'Feed', icon: HomeIcon },
    { id: 'trending', label: 'Trending', icon: FireIcon },
    { id: 'favorites', label: 'Favorites', icon: HeartIcon },
  ]

  const contentTypes = [
    { id: 'news', label: 'News', icon: NewspaperIcon },
    { id: 'movies', label: 'Movies', icon: FilmIcon },
    { id: 'social', label: 'Social', icon: ChatBubbleLeftRightIcon },
  ]

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col" data-testid="sidebar">
      {/* Logo/Title */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Content Dashboard
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4" data-testid="sidebar-nav">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Navigation
          </h2>

          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <motion.button
                key={item.id}
                data-testid={'${item-id}-nav'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch(setActiveSection(item.id as any))}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Content Types */}
        <div className="mt-8 space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Content Types
          </h2>

          {contentTypes.map((type) => {
            const Icon = type.icon

            return (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{type.label}</span>
              </motion.div>
            )
          })}
        </div>

        {/* User Categories */}
        <div className="mt-8 space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Your Categories
          </h2>

          {categories.map((category) => (
            <div key={category} className="px-3 py-1">
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                {category}
              </span>
            </div>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <SettingsPanel />
      </div>
      
    </div>
  )
}

export default Sidebar
