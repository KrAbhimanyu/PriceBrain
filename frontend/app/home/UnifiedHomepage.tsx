'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRole } from '@/providers';
import { BuyerHomepage, SellerDashboard, AdminDashboard } from '@/components/personalization';
import { GuestHomepage } from './GuestHomepage';

export function UnifiedHomepage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { role } = useRole();
  
  // Show role-specific dashboard for authenticated users
  if (isAuthenticated && user) {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'seller':
        return <SellerDashboard />;
      case 'buyer':
      default:
        return <BuyerHomepage />;
    }
  }
  
  // Show guest homepage for unauthenticated users
  return <GuestHomepage />;
}
