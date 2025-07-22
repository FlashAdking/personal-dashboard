'use client'
import { useState, useEffect } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { toggleSidebar, toggleDarkMode } from '../../store/slices/uiSlice'
import Header from './Header'
import Sidebar from './Sidebar'
import ContentFeed from './ContentFeed'
import { motion, AnimatePresence } from 'framer-motion'

const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const { darkMode, sidebarOpen } = useAppSelector(state => state.ui)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }
    
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`} data-testid="dashboard-layout">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => dispatch(toggleSidebar())}
          />
        )}
      </AnimatePresence>

      {/* FIXED: Layout Container */}
      <div className="flex h-screen">
        {/* FIXED: Sidebar - Proper visibility control */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={isMobile ? { x: -300 } : { width: 0 }}
              animate={isMobile ? { x: 0 } : { width: 256 }}
              exit={isMobile ? { x: -300 } : { width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`
                ${isMobile ? 'fixed' : 'relative'} 
                top-0 left-0 z-50 h-screen
                ${isMobile ? 'w-64' : 'overflow-hidden'}
              `}
            >
              <div className="w-64 h-full">
                <Sidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Header */}
          <div className="flex-shrink-0">
            <Header />
          </div>
          
          {/* Content - Scrollable */}
          <main 
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" 
            data-testid="dashboard-main"
          >
            <ContentFeed />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
