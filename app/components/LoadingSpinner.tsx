import { motion, AnimatePresence } from "framer-motion";

export default function LoadingSpinner({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex justify-center items-center bg-white/70 backdrop-blur-md z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
