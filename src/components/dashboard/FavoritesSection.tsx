'use client'
import { useEffect, useState } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import ContentCard from '../content/ContentCard'
import EmptyState from '../common/EmptyState'
import { motion } from 'framer-motion'
import { HeartIcon } from '@heroicons/react/24/outline'
import { ContentItem } from '../../types'
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { reorderFavorites } from '../../store/slices/userPreferencesSlice'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { reorderContent } from '../../store/slices/contentSlice'

const FavoritesSection: React.FC = () => {
    const dispatch = useAppDispatch()
    const { favoriteContent } = useAppSelector(state => state.userPreferences)
    const { feed } = useAppSelector(state => state.content)
    const [favoriteItems, setFavoriteItems] = useState<ContentItem[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        // Filter feed items that are in favorites and maintain order
        const favorites = favoriteContent
            .map(favoriteId => feed.find(item => item.id === favoriteId))
            .filter((item): item is ContentItem => item !== undefined)

        setFavoriteItems(favorites)
    }, [favoriteContent, feed])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }


    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (active.id !== over?.id && over) {
            const oldIndex = favoriteItems.findIndex(item => item.id === active.id)
            const newIndex = favoriteItems.findIndex(item => item.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                // Reorder the display array
                const reorderedFavorites = arrayMove(favoriteItems, oldIndex, newIndex)
                setFavoriteItems(reorderedFavorites)

                // **CRITICAL FIX**: Update Redux with the new ID order
                const reorderedIds = reorderedFavorites.map(item => item.id)
                dispatch(reorderFavorites(reorderedIds))
            }
        }
    }


    if (favoriteItems.length === 0) {
        return (
            <EmptyState
                title="No favorites yet"
                description="Start adding content to your favorites to see them here. Click the heart icon on any content card to add it to your favorites."
                action={
                    <div className="text-center">
                        <HeartIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    </div>
                }
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <HeartIcon className="h-8 w-8 text-red-500" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Your Favorites
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {favoriteItems.length} saved {favoriteItems.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={favoriteItems.map(item => item.id)}
                    strategy={rectSortingStrategy}
                >
                    <motion.div
                        layout
                        className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        data-testid="favorites-grid"
                    >
                        {favoriteItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ContentCard item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                </SortableContext>

                <DragOverlay>
                    {activeId ? (
                        <ContentCard
                            item={favoriteItems.find(item => item.id === activeId)!}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}

export default FavoritesSection
