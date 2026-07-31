// Global AI Types for AskBrain Operating Layer

export interface AskBrainMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: AskBrainAttachment[];
  metadata?: AskBrainMessageMetadata;
  streaming?: boolean;
  sources?: AskBrainSource[];
}

export interface AskBrainAttachment {
  type: 'image' | 'document' | 'url' | 'product' | 'list';
  url?: string;
  name?: string;
  data?: any;
}

export interface AskBrainMessageMetadata {
  intent?: string;
  confidence?: number;
  contextUsed?: string[];
  recommendations?: any[];
  actions?: AskBrainAction[];
}

export interface AskBrainAction {
  type: 'navigate' | 'apply_coupon' | 'add_to_cart' | 'add_to_wishlist' | 'compare' | 'filter' | 'search';
  payload: any;
  label: string;
}

export interface AskBrainSource {
  type: 'product' | 'review' | 'article' | 'knowledge_graph' | 'rag';
  title: string;
  url?: string;
  score?: number;
}

export interface AskBrainConversation {
  id: string;
  userId: string;
  title?: string;
  messages: AskBrainMessage[];
  context: AskBrainContext;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AskBrainContext {
  // Page Context
  currentPage: string;
  currentRoute: string;
  currentUrl: string;
  
  // Product Context
  currentProduct?: {
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    seller?: string;
    rating?: number;
    reviews?: number;
  };
  
  // Category Context
  currentCategory?: {
    id: string;
    name: string;
    path: string[];
  };
  
  // Search Context
  searchContext?: {
    query: string;
    filters: Record<string, any>;
    resultsCount: number;
  };
  
  // Cart Context
  cartContext?: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  
  // Wishlist Context
  wishlistContext?: {
    items: WishlistItem[];
    itemCount: number;
  };
  
  // User Context
  userContext?: {
    id: string;
    role: 'buyer' | 'seller' | 'admin' | 'enterprise';
    preferences: UserPreferences;
    budget?: number;
  };
  
  // Mission Context
  missionContext?: {
    activeMission?: Mission;
    progress?: number;
  };
  
  // Organization Context
  organizationContext?: {
    id?: string;
    name?: string;
    workspace?: string;
  };
  
  // Dashboard Context (for seller/admin)
  dashboardContext?: {
    type: 'seller' | 'admin' | 'enterprise';
    stats?: DashboardStats;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  addedAt: Date;
}

export interface UserPreferences {
  style?: string[];
  colors?: string[];
  brands?: string[];
  size?: string;
  gender?: string;
  locations?: string[];
}

export interface Mission {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
}

export interface DashboardStats {
  revenue?: number;
  orders?: number;
  conversion?: number;
  products?: number;
  rating?: number;
  lowStock?: number;
}

export interface AskBrainState {
  // Panel State
  isOpen: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  dockPosition: 'left' | 'right' | 'bottom';
  panelSize: { width: number; height: number };
  panelPosition: { x: number; y: number };
  
  // Conversation State
  conversation: AskBrainConversation | null;
  conversations: AskBrainConversation[];
  isTyping: boolean;
  
  // Context State
  currentContext: AskBrainContext;
  
  // Settings
  settings: AskBrainSettings;
  
  // Notifications
  unreadCount: number;
  notifications: AskBrainNotification[];
  
  // Mode
  mode: 'chat' | 'situation' | 'mission' | 'shopping';
}

export interface AskBrainSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  shortcutsEnabled: boolean;
  proactiveEnabled: boolean;
  contextAwarenessEnabled: boolean;
}

export interface AskBrainNotification {
  id: string;
  type: 'info' | 'warning' | 'deal' | 'reminder' | 'recommendation';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  autoDismiss?: boolean;
}

export interface AskBrainQuery {
  message: string;
  context?: Partial<AskBrainContext>;
  mode?: 'chat' | 'situation' | 'mission' | 'shopping';
  attachments?: AskBrainAttachment[];
}

export interface AskBrainResponse {
  message: AskBrainMessage;
  context: AskBrainContext;
  suggestions?: string[];
  actions?: AskBrainAction[];
}

// Proactive Suggestion Types
export interface ProactiveSuggestion {
  id: string;
  type: 'price_drop' | 'alternative' | 'duplicate' | 'warranty' | 'completion' | 'event';
  title: string;
  description: string;
  confidence: number;
  action?: AskBrainAction;
  timestamp: Date;
  pageTrigger?: string[];
}

// Global AI Panel Component Props
export interface AskBrainPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: Partial<AskBrainContext>;
}

// Floating Button Props
export interface FloatingAIButtonProps {
  onClick?: () => void;
  unreadCount?: number;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left';
}

// Context Provider Types
export interface PageContextValue {
  page: string;
  route: string;
  product: AskBrainContext['currentProduct'];
  category: AskBrainContext['currentCategory'];
  search: AskBrainContext['searchContext'];
  cart: AskBrainContext['cartContext'];
  wishlist: AskBrainContext['wishlistContext'];
  user: AskBrainContext['userContext'];
  mission: AskBrainContext['missionContext'];
  organization: AskBrainContext['organizationContext'];
  dashboard: AskBrainContext['dashboardContext'];
}
