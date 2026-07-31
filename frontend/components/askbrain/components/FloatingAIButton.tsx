'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAskBrain } from '../context/askbrain-context';

interface FloatingAIButtonProps {
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

export function FloatingAIButton({ 
  size = 'md', 
  position = 'bottom-right',
  className = '' 
}: FloatingAIButtonProps) {
  const { state, togglePanel } = useAskBrain();
  const [isHovered, setIsHovered] = useState(false);
  const [isBreathing, setIsBreathing] = useState(true);
  const [isGlowing, setIsGlowing] = useState(true);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  // Breathing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBreathing(true);
      setTimeout(() => setIsBreathing(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Pulse effect for notifications
  useEffect(() => {
    if (state.unreadCount > 0) {
      setIsGlowing(true);
    }
  }, [state.unreadCount]);

  return (
    <motion.button
      onClick={togglePanel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed ${positionClasses[position]} z-[9999]
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400
        shadow-lg
        cursor-pointer
        flex items-center justify-center
        group
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: isGlowing && state.unreadCount > 0
          ? [
              "0 0 20px rgba(168, 85, 247, 0.7)",
              "0 0 40px rgba(168, 85, 247, 0.5)",
              "0 0 20px rgba(168, 85, 247, 0.7)",
            ]
          : state.isOpen
          ? "0 0 30px rgba(168, 85, 247, 0.8)"
          : "0 0 20px rgba(168, 85, 247, 0.4)"
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white/30"
        animate={{
          scale: isBreathing ? [1, 1.1, 1] : 1,
          opacity: isBreathing ? [0.5, 0.8, 0.5] : 0.5,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-sm" />

      {/* Icon */}
      <AnimatePresence mode="wait">
        {state.isOpen ? (
          <motion.svg
            key="close"
            width={iconSizes[size]}
            height={iconSizes[size]}
            viewBox="0 0 24 24"
            fill="none"
            className="text-white z-10"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        ) : (
          <motion.div
            key="brain"
            className="z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <svg
              width={iconSizes[size]}
              height={iconSizes[size]}
              viewBox="0 0 48 48"
              fill="none"
              className="text-white"
            >
              {/* Brain Icon */}
              <path
                d="M24 4C19.5 4 16 8 16 12c0 1.5.5 3 1 4.5C15 18 13 21 13 24c0 4 3 7 7 7h8c4 0 7-3 7-7 0-3-2-6-4-7.5.5-1.5 1-3 1-4.5 0-4-3.5-8-8-8z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M24 4v40M16 12c4 0 8 4 8 8s-4 8-8 8M32 12c-4 0-8 4-8 8s4 8 8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              {/* Neural Dots */}
              <circle cx="20" cy="16" r="2" fill="white" />
              <circle cx="28" cy="16" r="2" fill="white" />
              <circle cx="24" cy="24" r="2.5" fill="white" />
              <circle cx="18" cy="28" r="1.5" fill="white" />
              <circle cx="30" cy="28" r="1.5" fill="white" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Badge */}
      <AnimatePresence>
        {state.unreadCount > 0 && !state.isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
              {state.unreadCount > 9 ? '9+' : state.unreadCount}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && !state.isOpen && (
          <motion.div
            className="absolute bottom-full mb-3 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AskBrain AI
              <span className="text-gray-400 text-xs ml-1">⌘K</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple Effect on Click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/30"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  );
}
