'use client'

import { motion } from 'framer-motion'

export const Preloader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="relative">
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-muted"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-l-4 border-primary"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-0 left-0 h-16 w-16 rounded-full border-b-4 border-r-4 border-secondary"
          initial={{ rotate: 45 }}
          animate={{
            rotate: 405
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="mt-8 text-center text-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Chargement...
        </motion.div>
      </div>
    </div>
  )
}
