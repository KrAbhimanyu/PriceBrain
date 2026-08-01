'use client';

import { useState } from 'react';
import {
  Accessibility, Contrast, Type, Eye, Keyboard, Volume2,
  Move, Moon, Sun, Gauge, Sparkles, Shield, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalExperience, LANGUAGES, CURRENCIES, REGIONS } from '@/providers/GlobalExperienceProvider';
import type { ContrastMode, FontSize, LineHeight, ColorBlindnessMode } from '@/types';

export default function AccessibilitySettingsPage() {
  const { 
    preferences, 
    setLanguage, 
    setCurrency, 
    setRegion,
    accessibility, 
    setAccessibility,
    toggleHighContrast,
    setFontSize,
    toggleReducedMotion,
    toggleDyslexicFont,
    isRTL
  } = useGlobalExperience();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const fontSizes: { value: FontSize; label: string; size: string }[] = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium (Default)', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'extra_large', label: 'Extra Large', size: '20px' },
  ];
  
  const lineHeights: { value: LineHeight; label: string }[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Relaxed' },
  ];
  
  const contrastModes: { value: ContrastMode; label: string; description: string }[] = [
    { value: 'normal', label: 'Normal', description: 'Default contrast levels' },
    { value: 'high', label: 'High Contrast', description: 'Enhanced contrast for better visibility' },
    { value: 'maximum', label: 'Maximum Contrast', description: 'Highest contrast for maximum readability' },
  ];
  
  const colorBlindnessModes: { value: ColorBlindnessMode; label: string; description: string }[] = [
    { value: 'none', label: 'None', description: 'Standard color display' },
    { value: 'protanopia', label: 'Protanopia', description: 'Red-blind color vision' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind color vision' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind color vision' },
  ];
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Accessibility className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Accessibility & Global Settings</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Personalize your experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="accessibility" className="space-y-6">
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="global">Global Experience</TabsTrigger>
              <TabsTrigger value="keyboard">Keyboard Shortcuts</TabsTrigger>
            </TabsList>
            
            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              {/* Vision Settings */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    Vision Settings
                  </CardTitle>
                  <CardDescription>Customize visual elements for better readability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-slate-500" />
                        <label className="font-medium">Font Size</label>
                      </div>
                      <span className="text-sm text-slate-500">{fontSizes.find(f => f.value === accessibility.fontSize)?.size}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {fontSizes.map((size) => (
                        <button
                          key={size.value}
                          onClick={() => setFontSize(size.value)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            accessibility.fontSize === size.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <p className={`font-medium ${size.value === 'small' ? 'text-sm' : size.value === 'extra_large' ? 'text-lg' : 'text-base'}`}>
                            Aa
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{size.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Line Height */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Move className="h-4 w-4 text-slate-500" />
                        <label className="font-medium">Line Height</label>
                      </div>
                    </div>
                    <Select value={accessibility.lineHeight} onValueChange={(v: LineHeight) => setAccessibility({ lineHeight: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lineHeights.map((lh) => (
                          <SelectItem key={lh.value} value={lh.value}>
                            {lh.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Contrast Mode */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Contrast className="h-4 w-4 text-slate-500" />
                      <label className="font-medium">Contrast Mode</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {contrastModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setAccessibility({ contrastMode: mode.value })}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            accessibility.contrastMode === mode.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <p className="font-medium">{mode.label}</p>
                          <p className="text-sm text-slate-500 mt-1">{mode.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Blindness */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-500" />
                      <label className="font-medium">Color Blindness Filter</label>
                    </div>
                    <Select value={accessibility.colorBlindnessMode} onValueChange={(v: ColorBlindnessMode) => setAccessibility({ colorBlindnessMode: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorBlindnessModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label} - {mode.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Toggle Settings */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">High Contrast Mode</p>
                        <p className="text-sm text-slate-500">Increase contrast for better visibility</p>
                      </div>
                      <Switch checked={accessibility.highContrast} onCheckedChange={toggleHighContrast} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dyslexia-Friendly Font</p>
                        <p className="text-sm text-slate-500">Use OpenDyslexic font for easier reading</p>
                      </div>
                      <Switch checked={accessibility.dyslexicFont} onCheckedChange={toggleDyslexicFont} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Motion & Animation */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Move className="h-5 w-5 text-blue-500" />
                    Motion & Animation
                  </CardTitle>
                  <CardDescription>Control animations and motion effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reduced Motion</p>
                      <p className="text-sm text-slate-500">Minimize animations and transitions</p>
                    </div>
                    <Switch checked={accessibility.reducedMotion} onCheckedChange={toggleReducedMotion} />
                  </div>
                </CardContent>
              </Card>
              
              {/* Navigation & Interaction */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-green-500" />
                    Navigation & Interaction
                  </CardTitle>
                  <CardDescription>Customize how you interact with the interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Keyboard Navigation</p>
                      <p className="text-sm text-slate-500">Navigate using keyboard shortcuts</p>
                    </div>
                    <Switch checked={accessibility.keyboardNavigation} onCheckedChange={(v) => setAccessibility({ keyboardNavigation: v })} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Focus Indicators</p>
                      <p className="text-sm text-slate-500">Show visible focus rings on interactive elements</p>
                    </div>
                    <Switch checked={accessibility.focusIndicator} onCheckedChange={(v) => setAccessibility({ focusIndicator: v })} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Skip Links</p>
                      <p className="text-sm text-slate-500">Show links to skip to main content</p>
                    </div>
                    <Switch checked={accessibility.skipLinks} onCheckedChange={(v) => setAccessibility({ skipLinks: v })} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Voice Navigation</p>
                      <p className="text-sm text-slate-500">Enable voice commands for navigation</p>
                    </div>
                    <Switch checked={accessibility.voiceNavigation} onCheckedChange={(v) => setAccessibility({ voiceNavigation: v })} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Screen Reader Optimization</p>
                      <p className="text-sm text-slate-500">Enhanced support for screen readers</p>
                    </div>
                    <Switch checked={accessibility.screenReaderOptimized} onCheckedChange={(v) => setAccessibility({ screenReaderOptimized: v })} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Captions</p>
                      <p className="text-sm text-slate-500">Show captions for video content</p>
                    </div>
                    <Switch checked={accessibility.captionsEnabled} onCheckedChange={(v) => setAccessibility({ captionsEnabled: v })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Global Experience Tab */}
            <TabsContent value="global" className="space-y-6">
              {/* Language */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Language & Region
                  </CardTitle>
                  <CardDescription>Select your preferred language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="font-medium">Language</label>
                      <Select value={preferences.language} onValueChange={(v: typeof preferences.language) => setLanguage(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.nativeName}</span>
                                <span className="text-slate-500">({lang.name})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium">Currency</label>
                      <Select value={preferences.currency} onValueChange={(v: typeof preferences.currency) => setCurrency(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              <span className="flex items-center gap-2">
                                <span>{curr.symbol}</span>
                                <span>{curr.code}</span>
                                <span className="text-slate-500">({curr.name})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium">Region</label>
                      <Select value={preferences.region} onValueChange={(v: typeof preferences.region) => setRegion(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map((region) => (
                            <SelectItem key={region.code} value={region.code}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {isRTL && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-amber-800 dark:text-amber-200 font-medium">RTL Mode Active</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        The interface is now displayed in right-to-left layout for Arabic, Urdu, or Hebrew languages.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Keyboard Shortcuts Tab */}
            <TabsContent value="keyboard" className="space-y-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-orange-500" />
                    Keyboard Shortcuts
                  </CardTitle>
                  <CardDescription>Navigate quickly using these keyboard shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
                      { keys: ['Ctrl', '/'], description: 'Open AI Command Center' },
                      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
                      { keys: ['Ctrl', 'S'], description: 'Search products' },
                      { keys: ['Ctrl', 'H'], description: 'Go to homepage' },
                      { keys: ['Esc'], description: 'Close dialogs' },
                      { keys: ['Tab'], description: 'Navigate forward' },
                      { keys: ['Shift', 'Tab'], description: 'Navigate backward' },
                      { keys: ['Enter'], description: 'Activate selected' },
                      { keys: ['Space'], description: 'Play/Pause media' },
                      { keys: ['?', '?'], description: 'Show keyboard shortcuts' },
                      { keys: ['Ctrl', ','], description: 'Open settings' },
                    ].map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd key={j} className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
