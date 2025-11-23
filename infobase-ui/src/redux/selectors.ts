import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { Question } from './types';


export const selectQuestions = (state: RootState): Question[] => {
  console.log("Questions Selector : ", state.questions.items);
  return state.questions.items;
};

export const selectQuestionsLoading = (state: RootState): boolean => {
  return state.questions.isLoading;
};

export const selectQuestionsError = (state: RootState): string | null | undefined => {
  return state.questions.error;
};
export const selectSortBy = (state: RootState) => state.filters.sortBy;
export const selectSelectedTags = (state: RootState): string[] => state.filters.selectedTags;


export const selectSortedQuestions = createSelector(
  [selectQuestions, selectSortBy],
  (questions, sortBy): Question[] => {
    const sorted = [...questions];
    
    switch (sortBy) {
      case 'Most Upvoted':
        return sorted.sort((a, b) => b.upvotes - a.upvotes);
      case 'Most Answered':
        return sorted.sort((a, b) => b.answers - a.answers);
      case 'Most Recent':
        return sorted;
      default:
        return sorted;
    }
  }
);


export const selectFilteredQuestions = createSelector(
  [selectSortedQuestions, selectSelectedTags],
  (questions, selectedTags): Question[] => {
    if (selectedTags.length === 0) return questions;
    
    return questions.filter(question =>
      selectedTags.some(tag => question.tags.includes(tag))
    );
  }
);