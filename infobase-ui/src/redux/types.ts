export interface Author {
  name: string;
  avatar: string;
  initials: string;
}

export interface Question {
  id: number;
  author: Author;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  answers: number;
  askedAt: string;
  lastActivity: string;
}

export interface QuestionsState {
  items: Question[];
  isLoading: boolean;
  error: string | null | undefined;
}

export interface FiltersState {
  sortBy: SortOption;
  selectedTags: string[];
}

export type SortOption = 'Most Upvoted' | 'Most Recent' | 'Most Answered';
