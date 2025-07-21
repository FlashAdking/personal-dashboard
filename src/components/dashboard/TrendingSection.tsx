'use client'
import { useEffect } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { fetchContent } from '../../store/slices/contentSlice'
import ContentCard from '../content/ContentCard'
import { motion } from 'framer-motion'
import { FireIcon } from '@heroicons/react/24/outline'

const TrendingSection: React.FC = () => {
    const dispatch = useAppDispatch()
    const { feed, loading } = useAppSelector(state => state.content)
    const { categories } = useAppSelector(state => state.userPreferences)

    useEffect(() => {
        // Fetch trending content across all categories
        dispatch(fetchContent({
            categories: ['technology', 'sports', 'business', 'entertainment'],
            page: 1,
            contentTypes: ['news', 'movie', 'social']
        }))
    }, [dispatch])

    // Filter and sort by most recent for "trending"
    const trendingContent = Array.from(feed)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 12)

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <FireIcon className="h-8 w-8 text-orange-500" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Trending Now
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Popular content across all categories
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                >
                    {trendingContent.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ContentCard item={item} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}

export default TrendingSection
