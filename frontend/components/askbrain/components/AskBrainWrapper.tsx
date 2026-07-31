'use client';

import React from 'react';
import { AskBrainProvider } from '../context/askbrain-context';
import { FloatingAIButton } from './FloatingAIButton';
import { AskBrainPanel } from './AskBrainPanel';
import { PageContextSync, useAskBrainShortcuts } from '../hooks/usePageContext';

interface AskBrainWrapperProps {
  children?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left';
  buttonSize?: 'sm' | 'md' | 'lg';
}

function AskBrainInternal({ position, buttonSize }: Omit<AskBrainWrapperProps, 'children'>) {
  // Enable global keyboard shortcuts
  useAskBrainShortcuts(true);

  return (
    <>
      {/* Global Context Sync - syncs page context automatically */}
      <PageContextSync />
      
      {/* Floating AI Button - visual identity */}
      <FloatingAIButton 
        position={position}
        size={buttonSize}
      />
      
      {/* AI Panel - chat interface */}
      <AskBrainPanel />
    </>
  );
}

export function AskBrainWrapper({ 
  children, 
  position = 'bottom-right', 
  buttonSize = 'md' 
}: AskBrainWrapperProps) {
  return (
    <AskBrainProvider>
      <AskBrainInternal position={position} buttonSize={buttonSize} />
      {children}
    </AskBrainProvider>
  );
}

// Export all components for granular usage
export { FloatingAIButton } from './FloatingAIButton';
export { AskBrainPanel } from './AskBrainPanel';
export { AskBrainProvider, useAskBrain } from '../context/askbrain-context';
export { 
  usePageContext, 
  useUpdatePageContext, 
  useProactiveSuggestions, 
  useContextActions,
  useAskBrainAvailability,
  useAskBrainShortcuts,
  PageContextSync 
} from '../hooks/usePageContext';
