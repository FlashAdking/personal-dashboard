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

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Handle mobile sidebar close when clicking outside
  const handleOverlayClick = () => {
    if (window.innerWidth < 768) { // Only close on mobile
      dispatch(toggleSidebar())
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`} data-testid="dashboard-layout">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ 
            x: sidebarOpen ? 0 : -300 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed md:relative left-0 top-0 z-40 h-screen w-64"
        >
          <Sidebar />
        </motion.div>

        {/* Main Content - FIXED: Proper mobile spacing */}
        <div className={`flex-1 transition-all duration-300 w-full ${
          sidebarOpen ? 'md:ml-0' : ''
        }`}>
          <Header />
          <main className="p-4 sm:p-6 lg:p-8" data-testid="dashboard-main">
            <ContentFeed />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
