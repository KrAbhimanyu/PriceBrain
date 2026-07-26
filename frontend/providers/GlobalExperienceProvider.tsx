'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
  Language, Currency, Region, GlobalPreferences, AccessibilitySettings,
  LanguageInfo, CurrencyInfo, RegionInfo
} from '@/types';

// Language data
export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', flag: '🇵🇰' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', flag: '🇨🇳' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', flag: '🇷🇺' },
];

// Currency data
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1, lastUpdated: new Date() },
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.012, lastUpdated: new Date() },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.011, lastUpdated: new Date() },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.0095, lastUpdated: new Date() },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 0.044, lastUpdated: new Date() },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 0.016, lastUpdated: new Date() },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 0.016, lastUpdated: new Date() },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 0.018, lastUpdated: new Date() },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 1.78, lastUpdated: new Date() },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 0.087, lastUpdated: new Date() },
];

// Region data
export const REGIONS: RegionInfo[] = [
  { code: 'india', name: 'India', festivals: ['Diwali', 'Holi', 'Dussehra', 'Navratri'], themes: ['Festive', 'Traditional'], timezone: 'Asia/Kolkata' },
  { code: 'usa', name: 'United States', festivals: ['Thanksgiving', 'Black Friday', 'Christmas'], themes: ['Holiday', 'Sale'], timezone: 'America/New_York' },
  { code: 'europe', name: 'Europe', festivals: ['Christmas', 'Easter'], themes: ['Seasonal', 'Cultural'], timezone: 'Europe/London' },
  { code: 'middle_east', name: 'Middle East', festivals: ['Ramadan', 'Eid'], themes: ['Ramadan', 'Eid'], timezone: 'Asia/Dubai' },
  { code: 'asia', name: 'Asia', festivals: ['Lunar New Year', 'Diwali'], themes: ['Cultural', 'Tech'], timezone: 'Asia/Singapore' },
  { code: 'africa', name: 'Africa', festivals: ['Independence Day'], themes: ['Cultural'], timezone: 'Africa/Lagos' },
  { code: 'latin_america', name: 'Latin America', festivals: ['Carnival'], themes: ['Festival', 'Cultural'], timezone: 'America/Sao_Paulo' },
  { code: 'oceania', name: 'Oceania', festivals: ['ANZAC Day'], themes: ['Seasonal'], timezone: 'Australia/Sydney' },
];

interface GlobalExperienceContextValue {
  // Global Preferences
  preferences: GlobalPreferences;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setRegion: (region: Region) => void;
  setTimezone: (tz: string) => void;
  
  // Currency Conversion
  convertPrice: (amount: number, from?: Currency, to?: Currency) => number;
  formatPrice: (amount: number, currency?: Currency) => string;
  
  // Accessibility Settings
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  toggleHighContrast: () => void;
  setFontSize: (size: AccessibilitySettings['fontSize']) => void;
  toggleReducedMotion: () => void;
  toggleDyslexicFont: () => void;
  
  // Utilities
  t: (key: string) => string;
  isRTL: boolean;
  currentLanguage: LanguageInfo;
  currentCurrency: CurrencyInfo;
  currentRegion: RegionInfo;
}

const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
  contrastMode: 'normal',
  fontSize: 'medium',
  lineHeight: 'normal',
  letterSpacing: 0,
  dyslexicFont: false,
  reducedMotion: false,
  colorBlindnessMode: 'none',
  screenReaderOptimized: false,
  keyboardNavigation: true,
  voiceNavigation: false,
  captionsEnabled: true,
  focusIndicator: true,
  skipLinks: true,
};

const defaultPreferences: GlobalPreferences = {
  language: 'en',
  currency: 'INR',
  region: 'india',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'en-IN',
};

const GlobalExperienceContext = createContext<GlobalExperienceContextValue | null>(null);

export function GlobalExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<GlobalPreferences>(defaultPreferences);
  const [accessibility, setAccessibilityState] = useState<AccessibilitySettings>(defaultAccessibility);
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('global_preferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
    
    const savedAccessibility = localStorage.getItem('accessibility_settings');
    if (savedAccessibility) {
      try {
        setAccessibilityState(JSON.parse(savedAccessibility));
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }
  }, []);
  
  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('global_preferences', JSON.stringify(preferences));
  }, [preferences]);
  
  useEffect(() => {
    localStorage.setItem('accessibility_settings', JSON.stringify(accessibility));
  }, [accessibility]);
  
  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizes = { small: '14px', medium: '16px', large: '18px', extra_large: '20px' };
    root.style.fontSize = fontSizes[accessibility.fontSize];
    
    // Line height
    const lineHeights = { compact: '1.2', normal: '1.5', relaxed: '1.8' };
    root.style.setProperty('--line-height', lineHeights[accessibility.lineHeight]);
    
    // Letter spacing
    root.style.setProperty('--letter-spacing', `${accessibility.letterSpacing}px`);
    
    // Reduced motion
    root.style.setProperty('--motion-duration', accessibility.reducedMotion ? '0ms' : '200ms');
    
    // High contrast
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Dyslexic font
    if (accessibility.dyslexicFont) {
      root.classList.add('dyslexic-font');
    } else {
      root.classList.remove('dyslexic-font');
    }
    
    // Color blindness filters
    if (accessibility.colorBlindnessMode !== 'none') {
      const filters = {
        protanopia: 'url(#protanopia)',
        deuteranopia: 'url(#deuteranopia)',
        tritanopia: 'url(#tritanopia)',
      };
      root.style.filter = filters[accessibility.colorBlindnessMode];
    } else {
      root.style.filter = 'none';
    }
    
    // Focus indicators
    if (accessibility.focusIndicator) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
    
    // Skip links
    const skipLink = document.getElementById('skip-link');
    if (accessibility.skipLinks) {
      if (!skipLink) {
        const link = document.createElement('a');
        link.id = 'skip-link';
        link.href = '#main-content';
        link.textContent = 'Skip to main content';
        link.className = 'skip-link';
        document.body.prepend(link);
      }
    } else {
      skipLink?.remove();
    }
  }, [accessibility]);
  
  const setLanguage = useCallback((lang: Language) => {
    setPreferences(p => ({ ...p, language: lang }));
    document.documentElement.lang = lang;
    
    const langInfo = LANGUAGES.find(l => l.code === lang);
    if (langInfo) {
      document.documentElement.dir = langInfo.direction;
    }
  }, []);
  
  const setCurrency = useCallback((currency: Currency) => {
    setPreferences(p => ({ ...p, currency }));
  }, []);
  
  const setRegion = useCallback((region: Region) => {
    const regionInfo = REGIONS.find(r => r.code === region);
    setPreferences(p => ({ 
      ...p, 
      region,
      timezone: regionInfo?.timezone || p.timezone 
    }));
  }, []);
  
  const setTimezone = useCallback((tz: string) => {
    setPreferences(p => ({ ...p, timezone: tz }));
  }, []);
  
  const convertPrice = useCallback((amount: number, from: Currency = 'INR', to?: Currency): number => {
    const toCurrency = to || preferences.currency;
    const fromRate = CURRENCIES.find(c => c.code === from)?.exchangeRate || 1;
    const toRate = CURRENCIES.find(c => c.code === toCurrency)?.exchangeRate || 1;
    return (amount * fromRate) / toRate;
  }, [preferences.currency]);
  
  const formatPrice = useCallback((amount: number, currency?: Currency): string => {
    const curr = currency || preferences.currency;
    const currencyInfo = CURRENCIES.find(c => c.code === curr) || CURRENCIES[0];
    const convertedAmount = curr !== 'INR' ? convertPrice(amount, 'INR', curr) : amount;
    
    return new Intl.NumberFormat(preferences.numberFormat, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: curr === 'JPY' ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  }, [preferences.currency, preferences.numberFormat, convertPrice]);
  
  const setAccessibility = useCallback((settings: Partial<AccessibilitySettings>) => {
    setAccessibilityState(p => ({ ...p, ...settings }));
  }, []);
  
  const toggleHighContrast = useCallback(() => {
    setAccessibilityState(p => ({ ...p, highContrast: !p.highContrast }));
  }, []);
  
  const setFontSize = useCallback((size: AccessibilitySettings['fontSize']) => {
    setAccessibilityState(p => ({ ...p, fontSize: size }));
  }, []);
  
  const toggleReducedMotion = useCallback(() => {
    setAccessibilityState(p => ({ ...p, reducedMotion: !p.reducedMotion }));
  }, []);
  
  const toggleDyslexicFont = useCallback(() => {
    setAccessibilityState(p => ({ ...p, dyslexicFont: !p.dyslexicFont }));
  }, []);
  
  // Simple translation function (would be expanded with actual translations)
  const t = useCallback((key: string): string => {
    // This would normally use a proper i18n library
    return key;
  }, []);
  
  const currentLanguage = LANGUAGES.find(l => l.code === preferences.language) || LANGUAGES[0];
  const currentCurrency = CURRENCIES.find(c => c.code === preferences.currency) || CURRENCIES[0];
  const currentRegion = REGIONS.find(r => r.code === preferences.region) || REGIONS[0];
  const isRTL = currentLanguage.direction === 'rtl';
  
  const value: GlobalExperienceContextValue = {
    preferences,
    setLanguage,
    setCurrency,
    setRegion,
    setTimezone,
    convertPrice,
    formatPrice,
    accessibility,
    setAccessibility,
    toggleHighContrast,
    setFontSize,
    toggleReducedMotion,
    toggleDyslexicFont,
    t,
    isRTL,
    currentLanguage,
    currentCurrency,
    currentRegion,
  };
  
  return (
    <GlobalExperienceContext.Provider value={value}>
      {children}
    </GlobalExperienceContext.Provider>
  );
}

export function useGlobalExperience() {
  const context = useContext(GlobalExperienceContext);
  if (!context) {
    throw new Error('useGlobalExperience must be used within a GlobalExperienceProvider');
  }
  return context;
}

export function useAccessibility() {
  const { accessibility, setAccessibility, toggleHighContrast, setFontSize, toggleReducedMotion, toggleDyslexicFont } = useGlobalExperience();
  return {
    settings: accessibility,
    setSettings: setAccessibility,
    toggleHighContrast,
    setFontSize,
    toggleReducedMotion,
    toggleDyslexicFont,
  };
}
