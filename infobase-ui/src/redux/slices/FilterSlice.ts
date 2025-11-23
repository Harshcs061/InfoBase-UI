import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FiltersState, SortOption } from '../types';

const initialState: FiltersState = {
  sortBy: 'Most Upvoted',
  selectedTags: [],
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },
    toggleTag: (state, action: PayloadAction<string>) => {
      const tag = action.payload;
      if (state.selectedTags.includes(tag)) {
        state.selectedTags = state.selectedTags.filter(t => t !== tag);
      } else {
        state.selectedTags.push(tag);
      }
    },
    clearFilters: (state) => {
      state.sortBy = 'Most Upvoted';
      state.selectedTags = [];
    },
  },
});

export const { setSortBy, toggleTag, clearFilters } = filterSlice.actions;
export default filterSlice.reducer;