export enum MissionType {
  WEDDING = 'wedding',
  VACATION = 'vacation',
  STUDY_ABROAD = 'study_abroad',
  FIRST_JOB = 'first_job',
  HOME_OFFICE = 'home_office',
  GAMING_SETUP = 'gaming_setup',
  PHOTOGRAPHY_STUDIO = 'photography_studio',
  FITNESS_JOURNEY = 'fitness_journey',
  HOME_RENOVATION = 'home_renovation',
  BABY_PREPARATION = 'baby_preparation',
  BUSINESS_LAUNCH = 'business_launch',
  FESTIVAL_PLANNING = 'festival_planning',
  CUSTOM = 'custom',
}

export enum MissionStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MissionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  WAITING_APPROVAL = 'waiting_approval',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ApprovalType {
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  REMINDER = 'reminder',
  TRACKING = 'tracking',
  SHARING = 'sharing',
  AUTOMATION_CREATE = 'automation_create',
  AUTOMATION_MODIFY = 'automation_modify',
  AUTOMATION_DELETE = 'automation_delete',
  CART_CREATE = 'cart_create',
  PLAN_SHARE = 'plan_share',
  PLUGIN_INSTALL = 'plugin_install',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PolicyType {
  BUDGET = 'budget',
  BRAND_PREFERENCE = 'brand_preference',
  SELLER_TRUST = 'seller_trust',
  RATING_THRESHOLD = 'rating_threshold',
  PRODUCT_PREFERENCE = 'product_preference',
  ECO_FRIENDLY = 'eco_friendly',
  APPROVAL_REQUIRED = 'approval_required',
  NOTIFICATION_PREFERENCE = 'notification_preference',
}

export enum AutomationRuleType {
  PRICE_TRACKING = 'price_tracking',
  COUPON_DISCOVERY = 'coupon_discovery',
  WARRANTY_TRACKING = 'warranty_tracking',
  SUBSCRIPTION_RENEWAL = 'subscription_renewal',
  PRODUCT_RECALL = 'product_recall',
  INVENTORY_MONITORING = 'inventory_monitoring',
  ACCESSORY_SUGGESTION = 'accessory_suggestion',
  UPGRADE_PLANNING = 'upgrade_planning',
  DEAL_MONITORING = 'deal_monitoring',
  FESTIVAL_PREPARATION = 'festival_preparation',
  STOCK_ALERT = 'stock_alert',
  PRICE_DROP_ALERT = 'price_drop_alert',
}

export enum AutomationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  PRICE_DROP = 'price_drop',
  PRICE_INCREASE = 'price_increase',
  BACK_IN_STOCK = 'back_in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  PRICE_TARGET_REACHED = 'price_target_reached',
  WARRANTY_EXPIRY = 'warranty_expiry',
  DELIVERY_UPDATE = 'delivery_update',
  DEAL_ALERT = 'deal_alert',
  MISSION_UPDATE = 'mission_update',
  WORKFLOW_COMPLETE = 'workflow_complete',
  APPROVAL_REQUIRED = 'approval_required',
  POLICY_VIOLATION = 'policy_violation',
  SYSTEM = 'system',
}

export enum ExecutionType {
  MISSION = 'mission',
  WORKFLOW = 'workflow',
  AUTOMATION = 'automation',
  APPROVAL = 'approval',
  POLICY = 'policy',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum PluginCategory {
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  INSURANCE = 'insurance',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  RESTAURANT = 'restaurant',
  REAL_ESTATE = 'real_estate',
  CUSTOM = 'custom',
}

export enum PluginStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ERROR = 'error',
  UPDATE_AVAILABLE = 'update_available',
}
