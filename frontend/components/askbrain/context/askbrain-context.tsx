'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  AskBrainState,
  AskBrainContext,
  AskBrainConversation,
  AskBrainMessage,
  AskBrainQuery,
  AskBrainResponse,
  AskBrainSettings,
  AskBrainNotification,
  AskBrainPanelProps,
  ProactiveSuggestion,
} from '../types/global-ai.types';

// Initial State
const initialState: AskBrainState = {
  isOpen: false,
  isMinimized: false,
  isFullscreen: false,
  dockPosition: 'right',
  panelSize: { width: 480, height: 600 },
  panelPosition: { x: 0, y: 0 },
  conversation: null,
  conversations: [],
  isTyping: false,
  currentContext: {
    currentPage: '',
    currentRoute: '',
    currentUrl: '',
  },
  settings: {
    theme: 'system',
    soundEnabled: true,
    notificationsEnabled: true,
    shortcutsEnabled: true,
    proactiveEnabled: true,
    contextAwarenessEnabled: true,
  },
  unreadCount: 0,
  notifications: [],
  mode: 'chat',
};

// Action Types
type Action =
  | { type: 'OPEN_PANEL' }
  | { type: 'CLOSE_PANEL' }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'MINIMIZE_PANEL' }
  | { type: 'MAXIMIZE_PANEL' }
  | { type: 'SET_DOCK_POSITION'; payload: 'left' | 'right' | 'bottom' }
  | { type: 'SET_PANEL_SIZE'; payload: { width: number; height: number } }
  | { type: 'SET_PANEL_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_CONVERSATION'; payload: AskBrainConversation | null }
  | { type: 'ADD_MESSAGE'; payload: AskBrainMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<AskBrainMessage> } }
  | { type: 'SET_MESSAGES'; payload: AskBrainMessage[] }
  | { type: 'SET_CONVERSATIONS'; payload: AskBrainConversation[] }
  | { type: 'SET_CONTEXT'; payload: Partial<AskBrainContext> }
  | { type: 'UPDATE_CONTEXT'; payload: Partial<AskBrainContext> }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_MODE'; payload: 'chat' | 'situation' | 'mission' | 'shopping' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AskBrainSettings> }
  | { type: 'ADD_NOTIFICATION'; payload: AskBrainNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_UNREAD_COUNT'; payload: number };

// Reducer
function reducer(state: AskBrainState, action: Action): AskBrainState {
  switch (action.type) {
    case 'OPEN_PANEL':
      return { ...state, isOpen: true, isMinimized: false };
    case 'CLOSE_PANEL':
      return { ...state, isOpen: false };
    case 'TOGGLE_PANEL':
      return { ...state, isOpen: !state.isOpen, isMinimized: false };
    case 'MINIMIZE_PANEL':
      return { ...state, isMinimized: !state.isMinimized };
    case 'MAXIMIZE_PANEL':
      return { ...state, isFullscreen: !state.isFullscreen, isMinimized: false };
    case 'SET_DOCK_POSITION':
      return { ...state, dockPosition: action.payload };
    case 'SET_PANEL_SIZE':
      return { ...state, panelSize: action.payload };
    case 'SET_PANEL_POSITION':
      return { ...state, panelPosition: action.payload };
    case 'SET_CONVERSATION':
      return { ...state, conversation: action.payload };
    case 'ADD_MESSAGE':
      if (!state.conversation) return state;
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.payload],
          updatedAt: new Date(),
        },
      };
    case 'UPDATE_MESSAGE':
      if (!state.conversation) return state;
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: state.conversation.messages.map((msg) =>
            msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
          ),
          updatedAt: new Date(),
        },
      };
    case 'SET_MESSAGES':
      if (!state.conversation) return state;
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: action.payload,
          updatedAt: new Date(),
        },
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_CONTEXT':
      return { ...state, currentContext: { ...state.currentContext, ...action.payload } as AskBrainContext };
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        currentContext: { ...state.currentContext, ...action.payload } as AskBrainContext,
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [], unreadCount: 0 };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    default:
      return state;
  }
}

// Context
interface AskBrainContextValue {
  state: AskBrainState;
  dispatch: React.Dispatch<Action>;
  
  // Panel Controls
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;
  setDockPosition: (position: 'left' | 'right' | 'bottom') => void;
  setPanelSize: (size: { width: number; height: number }) => void;
  
  // Conversations
  sendMessage: (message: string, attachments?: any[]) => Promise<void>;
  clearConversation: () => void;
  switchConversation: (id: string) => void;
  createNewConversation: () => void;
  
  // Context
  updateContext: (context: Partial<AskBrainContext>) => void;
  setPageContext: () => void;
  
  // Mode
  setMode: (mode: 'chat' | 'situation' | 'mission' | 'shopping') => void;
  
  // Settings
  updateSettings: (settings: Partial<AskBrainSettings>) => void;
  
  // Notifications
  addNotification: (notification: Omit<AskBrainNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Suggestions
  proactiveSuggestions: ProactiveSuggestion[];
  dismissSuggestion: (id: string) => void;
}

const AskBrainContextInstance = createContext<AskBrainContextValue | null>(null);

// Provider Component
export function AskBrainProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const conversationIdRef = useRef<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize or restore conversation on mount
  useEffect(() => {
    const storedConversation = localStorage.getItem('askbrain_conversation');
    if (storedConversation) {
      try {
        const conversation = JSON.parse(storedConversation);
        dispatch({ type: 'SET_CONVERSATION', payload: conversation });
        conversationIdRef.current = conversation.id;
      } catch (e) {
        console.error('Failed to restore conversation:', e);
      }
    } else {
      // Create new conversation
      const newConversation: AskBrainConversation = {
        id: `conv_${Date.now()}`,
        userId: 'anonymous',
        messages: [],
        context: initialState.currentContext,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      dispatch({ type: 'SET_CONVERSATION', payload: newConversation });
      conversationIdRef.current = newConversation.id;
    }

    // Load settings
    const storedSettings = localStorage.getItem('askbrain_settings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (e) {
        console.error('Failed to restore settings:', e);
      }
    }

    // Load notifications
    const storedNotifications = localStorage.getItem('askbrain_notifications');
    if (storedNotifications) {
      try {
        const notifications = JSON.parse(storedNotifications);
        dispatch({ type: 'SET_UNREAD_COUNT', payload: notifications.filter((n: any) => !n.read).length });
      } catch (e) {
        console.error('Failed to restore notifications:', e);
      }
    }
  }, []);

  // Persist conversation
  useEffect(() => {
    if (state.conversation) {
      localStorage.setItem('askbrain_conversation', JSON.stringify(state.conversation));
    }
  }, [state.conversation]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('askbrain_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('askbrain_notifications', JSON.stringify(state.notifications));
  }, [state.notifications]);

  // Auto-detect page context
  useEffect(() => {
    const context = detectPageContext(pathname, searchParams);
    dispatch({ type: 'SET_CONTEXT', payload: context });
  }, [pathname, searchParams]);

  // Panel Controls
  const openPanel = useCallback(() => dispatch({ type: 'OPEN_PANEL' }), []);
  const closePanel = useCallback(() => dispatch({ type: 'CLOSE_PANEL' }), []);
  const togglePanel = useCallback(() => dispatch({ type: 'TOGGLE_PANEL' }), []);
  const minimizePanel = useCallback(() => dispatch({ type: 'MINIMIZE_PANEL' }), []);
  const maximizePanel = useCallback(() => dispatch({ type: 'MAXIMIZE_PANEL' }), []);
  const setDockPosition = useCallback(
    (position: 'left' | 'right' | 'bottom') => dispatch({ type: 'SET_DOCK_POSITION', payload: position }),
    []
  );
  const setPanelSize = useCallback(
    (size: { width: number; height: number }) => dispatch({ type: 'SET_PANEL_SIZE', payload: size }),
    []
  );

  // Send Message
  const sendMessage = useCallback(async (message: string, attachments?: any[]) => {
    if (!state.conversation) return;

    // Create user message
    const userMessage: AskBrainMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      // Call AskBrain API
      const response = await fetch('/api/askbrain/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          context: state.currentContext,
          mode: state.mode,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data: AskBrainResponse = await response.json();

      // Add assistant message
      const assistantMessage: AskBrainMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
        metadata: data.message.metadata,
        sources: data.sources,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

      // Add suggestions as notifications if proactive
      if (data.suggestions?.length && state.settings.proactiveEnabled) {
        data.suggestions.slice(0, 2).forEach((suggestion: string) => {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: `notif_${Date.now()}`,
              type: 'recommendation',
              title: 'AI Suggestion',
              message: suggestion,
              timestamp: new Date(),
              read: false,
            },
          });
        });
      }
    } catch (error) {
      console.error('AskBrain error:', error);
      
      // Add error message
      const errorMessage: AskBrainMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  }, [state.conversation, state.currentContext, state.mode, state.settings.proactiveEnabled]);

  // Clear Conversation
  const clearConversation = useCallback(() => {
    if (!state.conversation) return;
    
    const newConversation: AskBrainConversation = {
      ...state.conversation,
      id: `conv_${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'SET_CONVERSATION', payload: newConversation });
    conversationIdRef.current = newConversation.id;
  }, [state.conversation]);

  // Switch Conversation
  const switchConversation = useCallback((id: string) => {
    const conversation = state.conversations.find((c) => c.id === id);
    if (conversation) {
      dispatch({ type: 'SET_CONVERSATION', payload: conversation });
      conversationIdRef.current = id;
    }
  }, [state.conversations]);

  // Create New Conversation
  const createNewConversation = useCallback(() => {
    const newConversation: AskBrainConversation = {
      id: `conv_${Date.now()}`,
      userId: state.conversation?.userId || 'anonymous',
      messages: [],
      context: state.currentContext,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    dispatch({ type: 'SET_CONVERSATION', payload: newConversation });
    conversationIdRef.current = newConversation.id;
  }, [state.conversation?.userId, state.currentContext]);

  // Update Context
  const updateContext = useCallback((context: Partial<AskBrainContext>) => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: context });
  }, []);

  // Set Page Context
  const setPageContext = useCallback(() => {
    const context = detectPageContext(pathname, searchParams);
    dispatch({ type: 'SET_CONTEXT', payload: context });
  }, [pathname, searchParams]);

  // Set Mode
  const setMode = useCallback((mode: 'chat' | 'situation' | 'mission' | 'shopping') => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  // Update Settings
  const updateSettings = useCallback((settings: Partial<AskBrainSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  // Notifications
  const addNotification = useCallback(
    (notification: Omit<AskBrainNotification, 'id' | 'timestamp' | 'read'>) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          ...notification,
          id: `notif_${Date.now()}`,
          timestamp: new Date(),
          read: false,
        },
      });
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  // Proactive Suggestions (placeholder - would come from API)
  const proactiveSuggestions: ProactiveSuggestion[] = [];

  const dismissSuggestion = useCallback((id: string) => {
    // Implementation would filter out dismissed suggestions
  }, []);

  const value: AskBrainContextValue = {
    state,
    dispatch,
    openPanel,
    closePanel,
    togglePanel,
    minimizePanel,
    maximizePanel,
    setDockPosition,
    setPanelSize,
    sendMessage,
    clearConversation,
    switchConversation,
    createNewConversation,
    updateContext,
    setPageContext,
    setMode,
    updateSettings,
    addNotification,
    markNotificationRead,
    clearNotifications,
    proactiveSuggestions,
    dismissSuggestion,
  };

  return <AskBrainContextInstance.Provider value={value}>{children}</AskBrainContextInstance.Provider>;
}

// Hook
export function useAskBrain() {
  const context = useContext(AskBrainContextInstance);
  if (!context) {
    throw new Error('useAskBrain must be used within AskBrainProvider');
  }
  return context;
}

// Utility: Detect Page Context
function detectPageContext(pathname: string, searchParams: URLSearchParams): Partial<AskBrainContext> {
  const context: Partial<AskBrainContext> = {
    currentPage: pathname,
    currentRoute: pathname,
    currentUrl: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
  };

  // Product Page
  if (pathname.includes('/product/')) {
    const productId = pathname.split('/product/')[1]?.split('?')[0];
    context.currentProduct = {
      id: productId || '',
      name: '', // Would be populated from store/API
      price: 0,
      category: '',
      brand: '',
    };
  }

  // Category Page
  if (pathname.includes('/category/')) {
    const categorySlug = pathname.split('/category/')[1]?.split('?')[0];
    context.currentCategory = {
      id: categorySlug || '',
      name: decodeURIComponent(categorySlug || ''),
      path: pathname.split('/').filter(Boolean),
    };
  }

  // Search Page
  if (pathname.includes('/search')) {
    const query = searchParams.get('q') || '';
    context.searchContext = {
      query,
      filters: Object.fromEntries(searchParams.entries()),
      resultsCount: 0,
    };
  }

  // Cart
  if (pathname.includes('/cart')) {
    // Would be populated from cart store
    context.cartContext = {
      items: [],
      total: 0,
      itemCount: 0,
    };
  }

  // Wishlist
  if (pathname.includes('/wishlist')) {
    // Would be populated from wishlist store
    context.wishlistContext = {
      items: [],
      itemCount: 0,
    };
  }

  // Mission Pages
  if (pathname.includes('/missions')) {
    context.missionContext = {
      activeMission: undefined,
      progress: 0,
    };
  }

  // Dashboard
  if (pathname.includes('/dashboard')) {
    context.dashboardContext = {
      type: 'seller',
      stats: {},
    };
  }

  // Admin
  if (pathname.includes('/admin')) {
    context.userContext = {
      id: '',
      role: 'admin',
      preferences: {},
    };
    context.dashboardContext = {
      type: 'admin',
      stats: {},
    };
  }

  // Organization/Enterprise
  if (pathname.includes('/organization') || pathname.includes('/enterprise')) {
    context.organizationContext = {
      id: '',
      name: '',
      workspace: '',
    };
    context.userContext = {
      id: '',
      role: 'enterprise',
      preferences: {},
    };
  }

  return context;
}
