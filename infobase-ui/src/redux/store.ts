// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from './slices/QuestionsSlice';
import filterReducer from './slices/FilterSlice';

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    filters: filterReducer,
  },
});

// Log to verify
const state = store.getState();
console.log('=== STORE DEBUG ===');
console.log('State:', state);
console.log('State keys:', Object.keys(state));
console.log('questions slice:', state.questions);
console.log('filters slice:', state.filters);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;