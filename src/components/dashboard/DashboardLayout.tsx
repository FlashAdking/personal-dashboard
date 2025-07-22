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
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => dispatch(toggleSidebar())}
          />
        )}
      </AnimatePresence>

      {/* Layout Container */}
      <div className="flex">
        {/* FIXED: Sidebar - Works for both desktop and mobile */}
        <div className={`
          fixed md:static top-0 left-0 z-50 h-screen
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen 
            ? 'translate-x-0 w-64' 
            : '-translate-x-full w-0 md:-translate-x-64 md:w-0'
          }
        `}>
          <div className="w-64 h-full">
            <Sidebar />
          </div>
        </div>

        {/* FIXED: Main Content - Adjusts to sidebar state */}
        <div className="flex-1 w-full">
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
