import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store"; 
import type { Question} from "../../redux/types"; 
import {
  upvoteQuestion,
  downvoteQuestion,
  upvoteQuestionOptimistic,
  downvoteQuestionOptimistic,
  revertUpvoteOptimistic,
  revertDownvoteOptimistic,
  fetchQuestionById,
} from "../../redux/slices/QuestionsSlice"; 
import type { UserShort } from "../../services/Payload";
import { isUserVotedToQuestion } from "../../services/QuestionService";

type Props = {
  questionId: number;
  canEdit?: boolean;
  onShare?: (id: number) => void;
  onEdit?: (id: number) => void;
};

export const Avatar: React.FC<{ user: UserShort; size?: number }> = ({ user, size = 36 }) => {
  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "U";
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 overflow-hidden"
    >
      { (user as any)?.avatar || (user as any)?.avatarUrl ? (
        <img src={(user as any).avatar || (user as any).avatarUrl} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// Thumbs Up Icon Component
const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

// Thumbs Down Icon Component
const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default function DetailedQuestionCard({ questionId, canEdit = false, onShare, onEdit }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoting, setIsUpvoting] = useState<boolean>(false);
  const [isDownvoting, setIsDownvoting] = useState<boolean>(false);
  const [voteStatus, setVoteStatus] = useState<number>(0); // 1: upvoted, -1: downvoted, 0: no vote

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Fetch question data
    const fetchData = async () => {
      try {
        // Fetch question details
        const questionPayload = await dispatch(fetchQuestionById(questionId as number)).unwrap();
        if (!mounted) return;
        setQuestion(questionPayload.question ?? null);

        // Fetch user's vote status
        const userVoteStatus = await isUserVotedToQuestion(questionId);
        if (!mounted) return;
        setVoteStatus(userVoteStatus);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load question");
        setQuestion(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [dispatch, questionId]);

  const handleUpvote = async () => {
    if (isUpvoting || isDownvoting) return;
    
    const previousVoteStatus = voteStatus;
    const wasUpvoted = voteStatus === 1;
    const wasDownvoted = voteStatus === -1;
    
    setIsUpvoting(true);
    
    // Determine vote adjustment for optimistic update
    let voteAdjustment = 0;
    if (wasUpvoted) {
      // Removing upvote: 1 -> 0
      voteAdjustment = -1;
      setVoteStatus(0);
      dispatch(revertUpvoteOptimistic(questionId));
    } else if (wasDownvoted) {
      // Switching from downvote to upvote: -1 -> 1
      voteAdjustment = 2;
      setVoteStatus(1);
      dispatch(revertDownvoteOptimistic(questionId));
      dispatch(upvoteQuestionOptimistic(questionId));
    } else {
      // Adding upvote: 0 -> 1
      voteAdjustment = 1;
      setVoteStatus(1);
      dispatch(upvoteQuestionOptimistic(questionId));
    }
    
    // Update local state immediately for optimistic UI
    if (question) {
      setQuestion({
        ...question,
        votes: (question.votes || 0) + voteAdjustment
      });
    }

    try {
      await dispatch(upvoteQuestion(questionId as number)).unwrap();
      
      // Refetch to ensure data is in sync with server
      const result = await dispatch(fetchQuestionById(questionId as number)).unwrap();
      setQuestion(result.question ?? null);
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToQuestion(questionId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Upvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      if (question) {
        setQuestion({
          ...question,
          votes: (question.votes || 0) - voteAdjustment
        });
      }
      
      // Revert Redux state
      if (wasUpvoted) {
        dispatch(upvoteQuestionOptimistic(questionId));
      } else if (wasDownvoted) {
        dispatch(downvoteQuestionOptimistic(questionId));
        dispatch(revertUpvoteOptimistic(questionId));
      } else {
        dispatch(revertUpvoteOptimistic(questionId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isDownvoting || isUpvoting) return;
    
    const previousVoteStatus = voteStatus;
    const wasUpvoted = voteStatus === 1;
    const wasDownvoted = voteStatus === -1;
    
    setIsDownvoting(true);
    
    // Determine vote adjustment for optimistic update
    let voteAdjustment = 0;
    if (wasDownvoted) {
      // Removing downvote: -1 -> 0
      voteAdjustment = 1;
      setVoteStatus(0);
      dispatch(revertDownvoteOptimistic(questionId));
    } else if (wasUpvoted) {
      // Switching from upvote to downvote: 1 -> -1
      voteAdjustment = -2;
      setVoteStatus(-1);
      dispatch(revertUpvoteOptimistic(questionId));
      dispatch(downvoteQuestionOptimistic(questionId));
    } else {
      // Adding downvote: 0 -> -1
      voteAdjustment = -1;
      setVoteStatus(-1);
      dispatch(downvoteQuestionOptimistic(questionId));
    }
    
    // Update local state immediately for optimistic UI
    if (question) {
      setQuestion({
        ...question,
        votes: (question.votes || 0) + voteAdjustment
      });
    }

    try {
      await dispatch(downvoteQuestion(questionId as number)).unwrap();
      
      // Refetch to ensure data is in sync with server
      const result = await dispatch(fetchQuestionById(questionId as number)).unwrap();
      setQuestion(result.question ?? null);
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToQuestion(questionId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Downvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      if (question) {
        setQuestion({
          ...question,
          votes: (question.votes || 0) - voteAdjustment
        });
      }
      
      // Revert Redux state
      if (wasDownvoted) {
        dispatch(downvoteQuestionOptimistic(questionId));
      } else if (wasUpvoted) {
        dispatch(upvoteQuestionOptimistic(questionId));
        dispatch(revertDownvoteOptimistic(questionId));
      } else {
        dispatch(revertDownvoteOptimistic(questionId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsDownvoting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-sm text-gray-500">
        Loading question...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-sm text-red-600">
        Error loading question: {error}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-sm text-gray-500">
        Question not found.
      </div>
    );
  }

  const hasUpvoted = voteStatus === 1;
  const hasDownvoted = voteStatus === -1;

  return (
    <article className="bg-white rounded shadow-sm p-6 mb-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{question.title}</h1>

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Avatar user={question.askedBy as UserShort} size={36} />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-sm">{question.askedBy.name}</span>
                <span className="text-xs text-gray-500">{new Date((question as any).askedAt ?? question.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="hidden sm:block border-l h-6" />

            <div className="flex gap-3 items-center pl-3">
              <div className="text-xs text-gray-500">{(question as any).answers ?? question.answer_count} answers</div>
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div className="hidden sm:flex sm:flex-col sm:items-end sm:gap-2 text-xs text-gray-500">
          {question.tags && question.tags.length > 0 && (
            <div className="mt-1 flex gap-2">
              {question.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mt-4 prose max-w-none text-sm">
        <ReactMarkdown>{(question as any).description ?? question.description}</ReactMarkdown>
      </div>

      {/* Small-screen tags */}
      <div className="mt-4 sm:hidden">
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: votes at left-bottom, actions at right */}
      <div className="mt-4 border-t pt-4 flex items-center justify-between">
        {/* Votes */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting || isDownvoting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${hasUpvoted 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-50' 
                : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }
              focus:ring-blue-500
              ${(isUpvoting || isDownvoting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={hasUpvoted ? "remove upvote" : "upvote"}
          >
            <ThumbsUpIcon className={`w-5 h-5 transition-all ${hasUpvoted ? 'fill-blue-700' : ''}`} />
            <span className="font-semibold">{(question as any).upvotes ?? question.votes}</span>
          </button>

          <button
            onClick={handleDownvote}
            disabled={isDownvoting || isUpvoting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${hasDownvoted 
                ? 'bg-red-100 text-red-700 hover:bg-red-50' 
                : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600'
              }
              focus:ring-red-500
              ${(isUpvoting || isDownvoting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={hasDownvoted ? "remove downvote" : "downvote"}
          >
            <ThumbsDownIcon className={`w-5 h-5 transition-all ${hasDownvoted ? 'fill-red-700' : ''}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onShare && (
            <button
              onClick={() => onShare(questionId)}
              className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Share
            </button>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(questionId)}
              className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
  );
}