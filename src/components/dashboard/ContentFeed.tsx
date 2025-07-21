'use client'
import { useEffect, useState } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { fetchContent, reorderContent } from '../../store/slices/contentSlice'
import { DndContext, closestCenter, DragEndEvent, DragOverlay,DragStartEvent} from '@dnd-kit/core'
import { arrayMove, SortableContext, rectSortingStrategy} from '@dnd-kit/sortable'
import ContentCard from '../content/ContentCard'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'
import TrendingSection from './TrendingSection'
import FavoritesSection from './FavoritesSection' // Added missing closing quote


const ContentFeed: React.FC = () => {
  const dispatch = useAppDispatch()
  const { feed, loading, error, hasMore } = useAppSelector(state => state.content)
  const { categories } = useAppSelector(state => state.userPreferences)
  const { activeSection, searchQuery } = useAppSelector(state => state.ui)
  const [filteredContent, setFilteredContent] = useState(feed)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Fetch content on component mount and when categories change
  useEffect(() => {
    if (categories.length > 0) {
      dispatch(fetchContent({ categories, page: 1 }))
    }
  }, [categories, dispatch])

  // Filter content based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent(feed)
    } else {
      const filtered = feed.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredContent(filtered)
    }
  }, [feed, searchQuery])

  // Handle drag and drop reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null) // Reset active item

    if (active.id !== over?.id) {
      const oldIndex = filteredContent.findIndex(item => item.id === active.id)
      const newIndex = filteredContent.findIndex(item => item.id === over?.id)

      const reorderedItems = arrayMove(filteredContent, oldIndex, newIndex)
      setFilteredContent(reorderedItems)
      dispatch(reorderContent(reorderedItems))
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Load more content for infinite scrolling
  const loadMoreContent = () => {
    if (!loading && hasMore) {
      dispatch(fetchContent({ categories, page: Math.floor(feed.length / 20) + 1 }))
    }
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'trending':
        return <TrendingSection />
      case 'favorites':
        return <FavoritesSection />
      case 'feed':
      default:
        return (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeSection === 'feed' ? 'Your Personalized Feed' :
                    activeSection === 'trending' ? 'Trending Content' :
                      'Your Favorites'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {searchQuery ? (
                    `Showing results for "${searchQuery}"`
                  ) : (
                    `${filteredContent.length} items • Updated just now`
                  )}
                </p>
              </div>

              {/* Filter/Sort Options */}
              <div className="flex items-center space-x-3">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="category">By Category</option>
                </select>
              </div>
            </div>

            {/* Content Grid with Drag and Drop */}
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={filteredContent.map(item => item.id)} strategy={rectSortingStrategy}>
                <motion.div
                  layout
                  className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  data-testid="content-grid"
                >
                  <AnimatePresence>
                    {filteredContent.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ContentCard item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <ContentCard item={filteredContent.find(item => item.id === activeId)!} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Load More Button / Infinite Scroll */}
            {hasMore && (
              <div className="flex justify-center pt-8">
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={loadMoreContent}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Load More Content
                  </motion.button>
                )}
              </div>
            )}

            {/* Content Stats */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              Showing {filteredContent.length} of {feed.length} items
              {searchQuery && (
                <button
                  onClick={() => setFilteredContent(feed)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )
    }
  }

  // Loading state
  if (loading && feed.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  // Error state
  if (error && feed.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.767 0L3.047 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to load content
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchContent({ categories, page: 1 }))}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (filteredContent.length === 0 && !loading) {
    return (
      <EmptyState
        title={searchQuery ? "No results found" : "No content available"}
        description={
          searchQuery
            ? `We couldn't find any content matching "${searchQuery}"`
            : "Try adjusting your preferences or check back later"
        }
        action={
          searchQuery ? null : (
            <button
              onClick={() => dispatch(fetchContent({ categories, page: 1 }))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Content
            </button>
          )
        }
      />
    )
  }

  return renderActiveSection()
}

export default ContentFeed
