// src/redux/slices/AnswerSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getAnswerByQId, voteAnswer, deleteAnswerApi } from "../../services/QuestionService";
import type { Answer } from "../types";
import type { VotePayload } from "../../services/Payload";

interface AnswersState {
  byId: Record<string, Answer>;
  idsByQuestion: Record<string, (string | number)[]>;
  loading: boolean;
  error: string | null;
}

const initialState: AnswersState = {
  byId: {},
  idsByQuestion: {},
  loading: false,
  error: null,
};

/**
 * Thunks
 */

// fetch answers for a question
export const fetchAnswers = createAsyncThunk<
  { questionId: number; answers: Answer[] },
  { questionId: number }
>("answers/fetch", async ({ questionId }) => {
  const res = await getAnswerByQId(questionId);
  // expecting res.data.answers array
  return { questionId, answers: res.data.answers };
});

// upvote an answer (calls vote API)
export const upvoteAnswer = createAsyncThunk(
  "answers/upvoteAnswer",
  async (answerId: number) => {
    const votePayload: VotePayload = { votingId: answerId, action: "upvote" };
    return await voteAnswer(votePayload);
  }
);

// downvote an answer (calls vote API)
export const downvoteAnswer = createAsyncThunk(
  "answers/downvoteAnswer",
  async (answerId: number) => {
    const votePayload: VotePayload = { votingId: answerId, action: "downvote" };
    return await voteAnswer(votePayload);
  }
);

// delete an answer (calls delete endpoint on service)
export const deleteAnswer = createAsyncThunk(
  "answers/deleteAnswer",
  async (answerId: number) => {
    return await deleteAnswerApi(answerId);
  }
);

/**
 * Slice
 */
const answersSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    // add a single answer (used when creating a new answer locally)
    addAnswer: (state, action: PayloadAction<{ questionId: string | number; answer: Answer }>) => {
      const { questionId, answer } = action.payload;
      const qid = String(questionId);
      const aid = String(answer.id);

      state.byId[aid] = answer;
      if (!state.idsByQuestion[qid]) state.idsByQuestion[qid] = [];
      // avoid duplicates
      if (!state.idsByQuestion[qid].some((id) => String(id) === aid)) {
        state.idsByQuestion[qid].push(answer.id);
      }
    },

    // optimistic vote changes (UI snappiness)
    upvoteAnswerOptimistic: (state, action: PayloadAction<number>) => {
      const aid = String(action.payload);
      const answer = state.byId[aid];
      if (answer) answer.votes = (answer.votes || 0) + 1;
    },
    downvoteAnswerOptimistic: (state, action: PayloadAction<number>) => {
      const aid = String(action.payload);
      const answer = state.byId[aid];
      if (answer) answer.votes = (answer.votes || 0) - 1;
    },
    revertUpvoteOptimistic: (state, action: PayloadAction<number>) => {
      const aid = String(action.payload);
      const answer = state.byId[aid];
      if (answer) answer.votes = (answer.votes || 0) - 1;
    },
    revertDownvoteOptimistic: (state, action: PayloadAction<number>) => {
      const aid = String(action.payload);
      const answer = state.byId[aid];
      if (answer) answer.votes = (answer.votes || 0) + 1;
    },

    // update accepted state: marks the provided answer as accepted and others false for same question
    updateAccepted: (state, action: PayloadAction<{ answerId: string | number }>) => {
      const aid = String(action.payload.answerId);
      const answer = state.byId[aid];
      if (!answer) return;

      const qid = String(answer.questionId);
      const ids = state.idsByQuestion[qid] ?? [];

      ids.forEach((id) => {
        const ans = state.byId[String(id)];
        if (ans) {
          ans.accepted = String(ans.id) === aid;
        }
      });
    },

    // remove answer from store (can be used for optimistic deletion too)
    removeAnswer: (state, action: PayloadAction<{ answerId: string | number }>) => {
      const aid = String(action.payload.answerId);
      const answer = state.byId[aid];
      if (!answer) return;

      const qid = String(answer.questionId);
      state.idsByQuestion[qid] = (state.idsByQuestion[qid] || []).filter(
        (id) => String(id) !== aid
      );
      delete state.byId[aid];
    },

    // clear error helper
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetch answers
      .addCase(fetchAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnswers.fulfilled, (state, action) => {
        state.loading = false;
        const qid = String(action.payload.questionId);
        state.idsByQuestion[qid] = action.payload.answers.map((a) => a.id);
        action.payload.answers.forEach((a) => {
          state.byId[String(a.id)] = a;
        });
      })
      .addCase(fetchAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch answers";
      })

      // upvote / downvote rejections (keep optimistic reducers for UI; server errors stored)
      .addCase(upvoteAnswer.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to upvote answer";
      })
      .addCase(downvoteAnswer.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to downvote answer";
      })

      // handle delete answer lifecycle
      .addCase(deleteAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // try to extract deleted id from payload in multiple common shapes
        const deletedId =
          payload?.id ?? payload?.answer?.id ?? (payload?.data && payload.data.id) ?? null;

        if (deletedId != null) {
          const aid = String(deletedId);
          const answer = state.byId[aid];
          if (answer) {
            const qid = String(answer.questionId);
            state.idsByQuestion[qid] = (state.idsByQuestion[qid] || []).filter(
              (id) => String(id) !== aid
            );
            delete state.byId[aid];
          } else {
            // If answer not found by id, attempt to scan and remove if any answer matches some payload shape
            // (keeps robust for various backend responses)
            if (Array.isArray(Object.values(state.byId))) {
              for (const key of Object.keys(state.byId)) {
                const a = state.byId[key];
                if (String(a.id) === String(deletedId)) {
                  const qid = String(a.questionId);
                  state.idsByQuestion[qid] = (state.idsByQuestion[qid] || []).filter(
                    (id) => String(id) !== key
                  );
                  delete state.byId[key];
                }
              }
            }
          }
        } else {
          // If API returned no id, we simply stop loading; caller can refetch if desired
        }
      })
      .addCase(deleteAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete answer";
      });
  },
});

export const {
  addAnswer,
  upvoteAnswerOptimistic,
  downvoteAnswerOptimistic,
  revertUpvoteOptimistic,
  revertDownvoteOptimistic,
  updateAccepted,
  removeAnswer,
  clearError,
} = answersSlice.actions;

export default answersSlice.reducer;

/**
 * Selectors
 */
export const selectAnswersForQuestion = (
  state: { answers: AnswersState },
  questionId: string | number
): Answer[] => {
  const ids = state.answers.idsByQuestion[String(questionId)] ?? [];
  return ids.map((id) => state.answers.byId[String(id)]).filter(Boolean);
};

export const selectAnswerById = (
  state: { answers: AnswersState },
  answerId: string | number
): Answer | undefined => state.answers.byId[String(answerId)];
