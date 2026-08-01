'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  TrendingUp,
  Tag,
  History,
  Store,
  UserCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { toggleMobileMenu, toggleSearchModal } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { NAV_LINKS, USER_MENU_LINKS } from '@/constants';
import { updateUser } from '@/store/slices/authSlice';
import type { UserRole } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { mobileMenuOpen } = useAppSelector((state) => state.ui);
  const role = user?.role || 'buyer';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSwitchRole = (newRole: UserRole) => {
    dispatch(updateUser({ role: newRole }));
    if (newRole === 'seller') {
      window.location.href = '/seller';
    } else if (newRole === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">PriceBrain</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md lg:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => dispatch(toggleSearchModal())}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Link>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <Badge variant="outline" className="mt-1 text-xs w-fit">
                        {role === 'seller' ? 'Seller Mode' : 'Buyer Mode'}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Role Switch */}
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">Switch Mode</div>
                  <DropdownMenuItem onClick={() => handleSwitchRole('buyer')}>
                    <UserCircle className="h-4 w-4 mr-2" />
                    Switch to Buyer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSwitchRole('seller')}>
                    <Store className="h-4 w-4 mr-2" />
                    Switch to Seller
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  {USER_MENU_LINKS.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => dispatch(logout())}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => dispatch(toggleMobileMenu())}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="container py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Links */}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
