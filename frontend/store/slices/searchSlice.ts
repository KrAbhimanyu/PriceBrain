import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchFilters } from '@/types';

interface SearchState {
  query: string;
  filters: SearchFilters;
  recentSearches: string[];
  isSearching: boolean;
}

const initialState: SearchState = {
  query: '',
  filters: {
    sortBy: 'relevance',
    page: 1,
    limit: 20,
  },
  recentSearches: [],
  isSearching: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'relevance',
        page: 1,
        limit: 20,
      };
    },
    setRecentSearches: (state, action: PayloadAction<string[]>) => {
      state.recentSearches = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const searches = state.recentSearches.filter((s) => s !== action.payload);
      searches.unshift(action.payload);
      state.recentSearches = searches.slice(0, 10);
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('recentSearches');
      }
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
  },
});

export const {
  setQuery,
  setFilters,
  clearFilters,
  setRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  setIsSearching,
} = searchSlice.actions;
export default searchSlice.reducer;
