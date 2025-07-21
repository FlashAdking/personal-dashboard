import { motion } from 'framer-motion'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

export default LoadingSpinner
