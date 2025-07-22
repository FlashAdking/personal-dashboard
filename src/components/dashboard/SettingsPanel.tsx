'use client'
import { useState } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { 
  updateCategories, 
  updateLanguage, 
  updateNotificationSettings 
} from '../../store/slices/userPreferencesSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  Cog6ToothIcon,
  BellIcon,
  GlobeAltIcon,
  TagIcon
} from '@heroicons/react/24/outline'

const SettingsPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const { categories, language, notificationSettings } = useAppSelector(state => state.userPreferences)
  const [isOpen, setIsOpen] = useState(false)
  
  const availableCategories = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'world', label: 'World News', icon: '🌍' }
  ]
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
  ]

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category]
    dispatch(updateCategories(updatedCategories))
  }

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    dispatch(updateNotificationSettings({
      [setting]: !notificationSettings[setting]
    }))
  }

  const handleLanguageChange = (languageCode: string) => {
    dispatch(updateLanguage(languageCode))
  }

  return (
    <>
      {/* Settings Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        data-testid="settings-button"
        title="Settings"
      >
        <Cog6ToothIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
            data-testid="settings-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
              data-testid="settings-panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Cog6ToothIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize your dashboard experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  data-testid="settings-close"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                
                {/* Content Categories Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <TagIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Content Categories
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Choose the topics you&apos;re interested in to personalize your feed
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {availableCategories.map(category => (
                      <motion.label 
                        key={category.id} 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          categories.includes(category.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        data-testid={`category-${category.id}`}
                      >
                        <input
                          type="checkbox"
                          checked={categories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="sr-only"
                        />
                        <span className="text-xl">{category.icon}</span>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category.label}
                          </span>
                        </div>
                        {categories.includes(category.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.label>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Selected: {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                  </div>
                </div>

                {/* Language Selection Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <GlobeAltIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Language
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Select your preferred language for the dashboard
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {languages.map(lang => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                          language === lang.code
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        data-testid={`language-${lang.code}`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lang.name}
                        </span>
                        {language === lang.code && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notification Settings Section */}
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <BellIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Manage what notifications you want to receive
                  </p>
                  
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            {key === 'news' && '📰'}
                            {key === 'recommendations' && '🎯'}
                            {key === 'social' && '📱'}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {key} notifications
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {key === 'news' && 'Breaking news and articles'}
                              {key === 'recommendations' && 'New movies and content suggestions'}
                              {key === 'social' && 'Social media updates and trends'}
                            </p>
                          </div>
                        </div>
                        
                        <motion.label
                          whileTap={{ scale: 0.95 }}
                          className="relative inline-flex items-center cursor-pointer"
                          data-testid={`notification-${key}`}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationToggle(key as keyof typeof notificationSettings)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </motion.label>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Settings are automatically saved
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      data-testid="settings-save"
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SettingsPanel
