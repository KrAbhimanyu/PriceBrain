'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAskBrain } from '../context/askbrain-context';
import { PageContextValue, AskBrainContext } from '../types/global-ai.types';

/**
 * Hook to get current page context
 * Automatically syncs with AskBrain global state
 */
export function usePageContext(): PageContextValue {
  const { state } = useAskBrain();
  
  return {
    page: state.currentContext.currentPage || '',
    route: state.currentContext.currentRoute || '',
    product: state.currentContext.currentProduct,
    category: state.currentContext.currentCategory,
    search: state.currentContext.searchContext,
    cart: state.currentContext.cartContext,
    wishlist: state.currentContext.wishlistContext,
    user: state.currentContext.userContext,
    mission: state.currentContext.missionContext,
    organization: state.currentContext.organizationContext,
    dashboard: state.currentContext.dashboardContext,
  };
}

/**
 * Hook to manually update context
 * Use this when you need to update specific context values
 */
export function useUpdatePageContext() {
  const { updateContext, setPageContext } = useAskBrain();

  const updateProductContext = (product: Partial<AskBrainContext['currentProduct']>) => {
    updateContext({
      currentProduct: product as AskBrainContext['currentProduct'],
    });
  };

  const updateCartContext = (cart: Partial<AskBrainContext['cartContext']>) => {
    updateContext({
      cartContext: cart as AskBrainContext['cartContext'],
    });
  };

  const updateSearchContext = (search: Partial<AskBrainContext['searchContext']>) => {
    updateContext({
      searchContext: search as AskBrainContext['searchContext'],
    });
  };

  const updateUserContext = (user: Partial<AskBrainContext['userContext']>) => {
    updateContext({
      userContext: user as AskBrainContext['userContext'],
    });
  };

  return {
    updateContext,
    setPageContext,
    updateProductContext,
    updateCartContext,
    updateSearchContext,
    updateUserContext,
  };
}

/**
 * Component that syncs page context automatically
 * Place this in your layout to enable automatic context detection
 */
export function PageContextSync() {
  const { setPageContext } = useAskBrain();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setPageContext();
  }, [pathname, searchParams, setPageContext]);

  return null;
}

/**
 * Hook to get proactive suggestions based on current context
 */
export function useProactiveSuggestions() {
  const { state, proactiveSuggestions } = useAskBrain();
  
  // Filter suggestions based on current page
  const relevantSuggestions = proactiveSuggestions.filter((suggestion) => {
    if (!suggestion.pageTrigger) return true;
    return suggestion.pageTrigger.some((page) => 
      state.currentContext.currentPage?.includes(page)
    );
  });

  return {
    suggestions: relevantSuggestions,
    hasSuggestions: relevantSuggestions.length > 0,
  };
}

/**
 * Hook to get context-aware quick actions
 */
export function useContextActions() {
  const { state } = useAskBrain();
  
  const getActions = () => {
    const actions: Array<{ label: string; action: () => void; icon: string }> = [];
    
    // Product page actions
    if (state.currentContext.currentProduct) {
      actions.push(
        { label: 'Compare', action: () => {}, icon: '⚖️' },
        { label: 'Add to Wishlist', action: () => {}, icon: '❤️' },
        { label: 'Track Price', action: () => {}, icon: '📊' }
      );
    }
    
    // Category page actions
    if (state.currentContext.currentCategory) {
      actions.push(
        { label: 'Set Budget', action: () => {}, icon: '💰' },
        { label: 'Save Search', action: () => {}, icon: '🔖' }
      );
    }
    
    // Cart page actions
    if (state.currentContext.cartContext?.itemCount) {
      actions.push(
        { label: 'Apply Coupon', action: () => {}, icon: '🎟️' },
        { label: 'Save Cart', action: () => {}, icon: '💾' }
      );
    }

    return actions;
  };

  return { actions: getActions() };
}

/**
 * Hook to check if AskBrain is available for current role
 */
export function useAskBrainAvailability() {
  const { state } = useAskBrain();
  
  const isAvailable = () => {
    const role = state.currentContext.userContext?.role;
    
    // Available for all roles by default
    return {
      chat: true,
      situation: true,
      mission: role !== 'admin', // Missions not for admin
      shopping: role !== 'enterprise', // Shopping not primary for enterprise
      sellerFeatures: role === 'seller' || role === 'admin',
      adminFeatures: role === 'admin',
      enterpriseFeatures: role === 'enterprise',
    };
  };

  return isAvailable();
}

/**
 * Hook for keyboard shortcuts
 */
export function useAskBrainShortcuts(enabled: boolean = true) {
  const { togglePanel } = useAskBrain();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, togglePanel]);
}
