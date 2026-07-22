import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

type UserRole = 'buyer' | 'seller';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  sellerVerified: boolean;
  sessions: Session[];
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: 'buyer',
  sellerVerified: false,
  sessions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.role = 'buyer';
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    setSellerVerified: (state, action: PayloadAction<boolean>) => {
      state.sellerVerified = action.payload;
    },
    setSessions: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload;
    },
    revokeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
    },
  },
});

export const { setUser, setLoading, logout, updateUser, switchRole, setSellerVerified, setSessions, revokeSession } = authSlice.actions;
export default authSlice.reducer;
