'use client'
import { useState, useCallback } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { addToFavorites, removeFromFavorites } from '../../store/slices/userPreferencesSlice'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { 
  HeartIcon as HeartOutline,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  CalendarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { ContentItem } from '../../types'

interface ContentCardProps {
  item: ContentItem
}

const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const dispatch = useAppDispatch()
  const { favoriteContent } = useAppSelector(state => state.userPreferences)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isFavorite = favoriteContent.includes(item.id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isFavorite) {
      dispatch(removeFromFavorites(item.id))
    } else {
      dispatch(addToFavorites(item.id))
    }
  }, [isFavorite, item.id, dispatch])

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Prevent navigation if this is a drag operation or if default was prevented
    if (e.defaultPrevented || isDragging) return
    
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }, [item.url, isDragging])

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'movie':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'social':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={{ y: isDragging ? 0 : -4 }} // Don't animate during drag
      onHoverStart={() => !isDragging && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
        isDragging ? 'opacity-50 shadow-2xl z-50 cursor-grabbing' : 'cursor-pointer'
      }`}
      onClick={handleCardClick}
      data-testid="content-card"
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 z-10 p-1 rounded bg-white dark:bg-gray-700 shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        data-testid="drag-handle"
      >
        <Bars3Icon className="h-4 w-4 text-gray-400" />
      </div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {item.imageUrl && !imageError ? (
          <motion.img
            layoutId={`image-${item.id}`}
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            animate={{ scale: isHovered && !isDragging ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-4xl">
              {item.type === 'news' ? '📰' : 
               item.type === 'movie' ? '🎬' : '📱'}
            </div>
          </div>
        )}
        
        {/* Content Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(item.type)}`}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          data-testid="favorite-button"
        >
          {isFavorite ? (
            <HeartSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartOutline className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-lg leading-tight">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDate(item.publishedAt)}
            </span>
            <span className="font-medium">{item.source}</span>
          </div>
          
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            {item.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <EyeIcon className="h-4 w-4" />
              <span className="text-xs">View</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ShareIcon className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <BookmarkIcon className="h-4 w-4" />
              <span className="text-xs">Save</span>
            </motion.button>
          </div>
          
          {item.url && item.url !== '#' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick(e)
              }}
            >
              Read More →
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ContentCard
