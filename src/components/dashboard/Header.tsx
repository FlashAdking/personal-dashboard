'use client'
import { useState } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import SettingsPanel from './SettingsPanel'
import { toggleSidebar, toggleDarkMode, setSearchQuery, setSearchActive } from '../../store/slices/uiSlice'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import debounce from 'lodash.debounce'

const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const { darkMode, searchQuery, searchActive } = useAppSelector(state => state.ui)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  const debouncedSearch = debounce((query: string) => {
    dispatch(setSearchQuery(query))
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
    dispatch(setSearchActive(value.length > 0))
  }

  const handleSearchFocus = () => {
    dispatch(setSearchActive(true))
  }

  const handleSearchBlur = () => {
    if (localSearchQuery.length === 0) {
      dispatch(setSearchActive(false))
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" data-testid="header">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu and Search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            data-testid="sidebar-toggle"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Search Bar */}
          <motion.div
            initial={{ width: 300 }}
            animate={{ width: searchActive ? 400 : 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              data-testid="search-input"
              type="text"
              value={localSearchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search news, movies, posts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </motion.div>
        </div>



        {/* Right side - Theme toggle, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            data-testid="theme-toggle"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-500" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>

          {/*notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative" data-testid="notifications-button">
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <SettingsPanel />

          {/* User Profile */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-testid="profile-button">
            <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
