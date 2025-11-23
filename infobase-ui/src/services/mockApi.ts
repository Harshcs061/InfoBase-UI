import { mockQuestions, mockUsers, mockTags, mockAnswers } from '../data/index';
import type { Question } from '../redux/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const shouldFail = () => Math.random() < 0.1;

export const mockApi = {
  questions: {
    // Get all questions
    getAll: async (): Promise<Question[]> => {
      await delay(500);
      if (shouldFail()) {
        throw new Error('Failed to fetch questions');
      }
      console.log(mockQuestions);
      return mockQuestions;
    },
    
    // Get single question by ID
    getById: async (id: number): Promise<Question | undefined> => {
      await delay(300);
      
      if (shouldFail()) {
        throw new Error(`Failed to fetch question ${id}`);
      }
      
      return mockQuestions.find(q => q.id === id);
    },
    
    // Upvote a question
    upvote: async (id: number): Promise<{ id: number; newUpvotes: number }> => {
      await delay(300);
      
      if (shouldFail()) {
        throw new Error('Failed to upvote question');
      }
      
      const question = mockQuestions.find(q => q.id === id);
      if (!question) {
        throw new Error('Question not found');
      }
      
      // Simulate backend updating the upvote count
      const newUpvotes = question.upvotes + 1;
      return { id, newUpvotes };
    },
    
    // Create a new question
    create: async (questionData: Omit<Question, 'id'>): Promise<Question> => {
      await delay(600);
      
      if (shouldFail()) {
        throw new Error('Failed to create question');
      }
      
      const newQuestion: Question = {
        ...questionData,
        id: Math.max(...mockQuestions.map(q => q.id)) + 1,
      };
      
      mockQuestions.push(newQuestion);
      return newQuestion;
    },
    
    // Delete a question
    delete: async (id: number): Promise<void> => {
      await delay(400);
      
      if (shouldFail()) {
        throw new Error('Failed to delete question');
      }
      
      const index = mockQuestions.findIndex(q => q.id === id);
      if (index === -1) {
        throw new Error('Question not found');
      }
      
      mockQuestions.splice(index, 1);
    },
  },
  
  users: {
    getAll: async () => {
      await delay(400);
      
      if (shouldFail()) {
        throw new Error('Failed to fetch users');
      }
      
      return mockUsers;
    },
    
    getById: async (id: number) => {
      await delay(300);
      return mockUsers.find(u => u.id === id);
    },
  },
  
  tags: {
    getAll: async () => {
      await delay(350);
      
      if (shouldFail()) {
        throw new Error('Failed to fetch tags');
      }
      
      return mockTags;
    },
  },
  
  answers: {
    getByQuestionId: async (questionId: number) => {
      await delay(400);
      
      if (shouldFail()) {
        throw new Error('Failed to fetch answers');
      }
      
      return mockAnswers.filter(a => a.questionId === questionId);
    },
  },
};