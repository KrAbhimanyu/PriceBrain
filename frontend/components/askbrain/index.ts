// AskBrain - Global AI Operating Layer
// Export all components, hooks, and types

export { AskBrainWrapper } from './components/AskBrainWrapper';
export { FloatingAIButton } from './components/FloatingAIButton';
export { AskBrainPanel } from './components/AskBrainPanel';

export { AskBrainProvider, useAskBrain } from './context/askbrain-context';

export {
  usePageContext,
  useUpdatePageContext,
  useProactiveSuggestions,
  useContextActions,
  useAskBrainAvailability,
  useAskBrainShortcuts,
  PageContextSync,
} from './hooks/usePageContext';

export * from './types/global-ai.types';

// Example integrations
export {
  ProductPageWithAskBrain,
  CartPageWithAskBrain,
  SellerDashboardWithAskBrain,
} from './example/ProductPageContextExample';
