import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Question, QuestionsState } from '../types';
import { mockApi } from '../../services/mockApi';

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async () => {
    const questions = await mockApi.questions.getAll();
    return questions;
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (id: number) => {
    const question = await mockApi.questions.getById(id);
    if (!question) throw new Error('Question not found');
    return question;
  }
);

export const upvoteQuestion = createAsyncThunk(
  'questions/upvoteQuestion',
  async (questionId: number) => {
    return await mockApi.questions.upvote(questionId);
  }
);

export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData: Omit<Question, 'id'>) => {
    return await mockApi.questions.create(questionData);
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (id: number) => {
    await mockApi.questions.delete(id);
    return id;
  }
);

const initialState: QuestionsState = {
  items: [],
  isLoading: false,
  error: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    upvoteQuestionOptimistic: (state, action: PayloadAction<number>) => {
      const question = state.items.find(q => q.id === action.payload);
      if (question) {
        question.upvotes += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all questions
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      
      // Fetch single question
      .addCase(fetchQuestionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch question';
      })
      
      // Upvote question
      .addCase(upvoteQuestion.fulfilled, (state, action) => {
        const question = state.items.find(q => q.id === action.payload.id);
        if (question) {
          question.upvotes = action.payload.newUpvotes;
        }
      })
      .addCase(upvoteQuestion.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to upvote question';
      })
      
      // Create question
      .addCase(createQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create question';
      })
      
      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(q => q.id !== action.payload);
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete question';
      });
  },
});

export const { upvoteQuestionOptimistic, clearError } = questionsSlice.actions;
export default questionsSlice.reducer;