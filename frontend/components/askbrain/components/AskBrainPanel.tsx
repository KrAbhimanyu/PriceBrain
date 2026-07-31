'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useAskBrain } from '../context/askbrain-context';
import { AskBrainMessage } from '../types/global-ai.types';

export function AskBrainPanel() {
  const { state, closePanel, sendMessage, clearConversation, setMode, updateSettings } = useAskBrain();
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();

  const { isOpen, isMinimized, isFullscreen, conversation, isTyping, mode, settings, dockPosition } = state;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closePanel();
        } else {
          // Open is handled by global listener
        }
      }
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  }, [input, isTyping, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Panel dimensions based on state
  const panelClasses = `
    fixed z-[10000] 
    ${dockPosition === 'right' ? 'right-6' : dockPosition === 'left' ? 'left-6' : 'left-1/2 -translate-x-1/2'}
    ${isMinimized ? 'bottom-24' : 'bottom-24'}
    rounded-2xl
    bg-white dark:bg-gray-900
    shadow-2xl
    overflow-hidden
    flex flex-col
    transition-all duration-300
    ${isFullscreen ? 'w-[95vw] h-[90vh]' : 'w-[480px] h-[600px]'}
    border border-gray-200 dark:border-gray-700
  `;

  // Glassmorphism header
  const Header = (
    <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className="text-white">
              <path d="M24 4C19.5 4 16 8 16 12c0 1.5.5 3 1 4.5C15 18 13 21 13 24c0 4 3 7 7 7h8c4 0 7-3 7-7 0-3-2-6-4-7.5.5-1.5 1-3 1-4.5 0-4-3.5-8-8-8z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">AskBrain</h2>
            <p className="text-white/80 text-xs">AI Commerce Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex bg-white/20 rounded-lg p-1">
            {['chat', 'situation', 'mission', 'shopping'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as any)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === m ? 'bg-white text-purple-600' : 'text-white/80 hover:text-white'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('askbrain:minimize'))}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect y="5" width="12" height="2" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('askbrain:fullscreen'))}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </button>
            <button
              onClick={closePanel}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M1 1l10 10M11 1L1 11" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Context Bar */}
      <div className="mt-3 flex flex-wrap gap-2">
        {state.currentContext.currentProduct && (
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4z"/>
            </svg>
            {state.currentContext.currentProduct.name}
          </span>
        )}
        {state.currentContext.currentCategory && (
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
            📁 {state.currentContext.currentCategory.name}
          </span>
        )}
        {state.currentContext.cartContext && state.currentContext.cartContext.itemCount > 0 && (
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
            🛒 {state.currentContext.cartContext.itemCount} items
          </span>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={panelClasses}
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {Header}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {(!conversation?.messages || conversation.messages.length === 0) && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-white">
                    <path d="M24 4C19.5 4 16 8 16 12c0 1.5.5 3 1 4.5C15 18 13 21 13 24c0 4 3 7 7 7h8c4 0 7-3 7-7 0-3-2-6-4-7.5.5-1.5 1-3 1-4.5 0-4-3.5-8-8-8z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to AskBrain
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
                  Your AI Commerce Intelligence companion. I understand your context automatically.
                </p>
                
                {/* Quick Suggestions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'Best phone under 30k',
                    'Wedding outfit ideas',
                    'Compare iPhone vs Samsung',
                    'Should I wait for sale?'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {conversation?.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none" className="text-white">
                    <path d="M24 4C19.5 4 16 8 16 12c0 1.5.5 3 1 4.5C15 18 13 21 13 24c0 4 3 7 7 7h8c4 0 7-3 7-7 0-3-2-6-4-7.5.5-1.5 1-3 1-4.5 0-4-3.5-8-8-8z" fill="currentColor" />
                  </svg>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about shopping..."
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
                  rows={1}
                  style={{ maxHeight: '120px' }}
                />
                
                {/* Attachment Buttons */}
                <div className="absolute left-2 bottom-2 flex gap-1">
                  <button type="button" className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42z"/>
                    </svg>
                  </button>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
            
            {/* Footer */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Powered by AI • Context-aware</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearConversation}
                  className="hover:text-purple-600 transition-colors"
                >
                  New Chat
                </button>
                <span>•</span>
                <button className="hover:text-purple-600 transition-colors">
                  History
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: AskBrainMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser 
          ? 'bg-gray-200 dark:bg-gray-700' 
          : 'bg-gradient-to-br from-purple-600 to-pink-500'
      }`}>
        {isUser ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 dark:text-gray-300">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none" className="text-white">
            <path d="M24 4C19.5 4 16 8 16 12c0 1.5.5 3 1 4.5C15 18 13 21 13 24c0 4 3 7 7 7h8c4 0 7-3 7-7 0-3-2-6-4-7.5.5-1.5 1-3 1-4.5 0-4-3.5-8-8-8z" fill="currentColor" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-tr-sm' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.sources.slice(0, 3).map((source, i) => (
              <span 
                key={i}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400"
              >
                📄 {source.title}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
