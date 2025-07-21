'use client'
import { useState, useEffect } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import {  useAppDispatch } from '../../hooks/useAppDispatch'
import { toggleSidebar, toggleDarkMode } from '../../store/slices/uiSlice'
import Header from './Header'
import Sidebar from './Sidebar'
import ContentFeed from './ContentFeed'
import { motion } from 'framer-motion'

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
    }`} data-testid="dashboard-layout" >
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 z-40 h-screen"
        >
          <Sidebar />
        </motion.div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <Header />
          <main className="p-6" data-testid="dashboard-main">
            <ContentFeed />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout;
