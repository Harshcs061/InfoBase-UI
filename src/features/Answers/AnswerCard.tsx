import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import type { Answer } from "../../redux/types";
import {
  upvoteAnswer,
  downvoteAnswer,
  upvoteAnswerOptimistic,
  downvoteAnswerOptimistic,
  revertUpvoteOptimistic,
  revertDownvoteOptimistic,
  selectAnswerById,
  deleteAnswer,
} from "../../redux/slices/AnswerSlice";
import type { UserShort } from "../../services/Payload";
import { isUserVotedToAnswer } from "../../services/QuestionService";
import { selectCommentsForAnswer } from "../../redux/slices/CommentSlice";
import { useNavigate } from "react-router-dom";

type Props = {
  answerId: number;
  showAcceptedBadge?: boolean;
  canAccept?: boolean;
  onAccept?: (id: number) => void;
  onOpenComments?: (answerId: number) => void; // <-- optional prop
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
      {(user as any)?.avatar || (user as any)?.avatarUrl ? (
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

// Comment Icon (speech bubble) to match DetailedQuestionCard style
const CommentIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function AnswerCard({ answerId, showAcceptedBadge = true, canAccept = false, onAccept, onOpenComments }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const answer = useSelector((state: RootState) => selectAnswerById(state, answerId)) as Answer | undefined;

  const [isUpvoting, setIsUpvoting] = useState<boolean>(false);
  const [isDownvoting, setIsDownvoting] = useState<boolean>(false);
  const [voteStatus, setVoteStatus] = useState<number>(0); // 1: upvoted, -1: downvoted, 0: no vote
  const [localVotes, setLocalVotes] = useState<number>(0);

  // delete-related states
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // current user id (safe selector)
  const currentUserId = useSelector((state: RootState) => state.users.user?.id ?? null) as number | null;

  useEffect(() => {
    let mounted = true;

    // Fetch user's vote status
    const fetchVoteStatus = async () => {
      try {
        const userVoteStatus = await isUserVotedToAnswer(answerId);
        if (!mounted) return;
        setVoteStatus(userVoteStatus);
      } catch (err: any) {
        console.error("Error fetching vote status:", err);
      }
    };

    fetchVoteStatus();

    return () => {
      mounted = false;
    };
  }, [answerId]);

  useEffect(() => {
    if (answer) {
      setLocalVotes(answer.votes || 0);
    }
  }, [answer]);

  const handleUpvote = async () => {
    if (isUpvoting || isDownvoting || !answer) return;
    
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
      dispatch(revertUpvoteOptimistic(answerId));
    } else if (wasDownvoted) {
      // Switching from downvote to upvote: -1 -> 1
      voteAdjustment = 2;
      setVoteStatus(1);
      dispatch(revertDownvoteOptimistic(answerId));
      dispatch(upvoteAnswerOptimistic(answerId));
    } else {
      // Adding upvote: 0 -> 1
      voteAdjustment = 1;
      setVoteStatus(1);
      dispatch(upvoteAnswerOptimistic(answerId));
    }
    
    // Update local state immediately for optimistic UI
    setLocalVotes(localVotes + voteAdjustment);

    try {
      await dispatch(upvoteAnswer(answerId as number)).unwrap();
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToAnswer(answerId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Upvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      setLocalVotes(localVotes);
      
      // Revert Redux state
      if (wasUpvoted) {
        dispatch(upvoteAnswerOptimistic(answerId));
      } else if (wasDownvoted) {
        dispatch(downvoteAnswerOptimistic(answerId));
        dispatch(revertUpvoteOptimistic(answerId));
      } else {
        dispatch(revertUpvoteOptimistic(answerId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isDownvoting || isUpvoting || !answer) return;
    
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
      dispatch(revertDownvoteOptimistic(answerId));
    } else if (wasUpvoted) {
      // Switching from upvote to downvote: 1 -> -1
      voteAdjustment = -2;
      setVoteStatus(-1);
      dispatch(revertUpvoteOptimistic(answerId));
      dispatch(downvoteAnswerOptimistic(answerId));
    } else {
      // Adding downvote: 0 -> -1
      voteAdjustment = -1;
      setVoteStatus(-1);
      dispatch(downvoteAnswerOptimistic(answerId));
    }
    
    // Update local state immediately for optimistic UI
    setLocalVotes(localVotes + voteAdjustment);

    try {
      await dispatch(downvoteAnswer(answerId as number)).unwrap();
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToAnswer(answerId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Downvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      setLocalVotes(localVotes);
      
      // Revert Redux state
      if (wasDownvoted) {
        dispatch(downvoteAnswerOptimistic(answerId));
      } else if (wasUpvoted) {
        dispatch(upvoteAnswerOptimistic(answerId));
        dispatch(revertDownvoteOptimistic(answerId));
      } else {
        dispatch(revertDownvoteOptimistic(answerId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsDownvoting(false);
    }
  };

  if (!answer) {
    return (
      <div className="p-4 bg-white rounded shadow-sm text-sm text-gray-500">
        Answer not found.
      </div>
    );
  }

  const hasUpvoted = voteStatus === 1;
  const hasDownvoted = voteStatus === -1;

  // comments count from slice
  const comments = useSelector((s: RootState) => selectCommentsForAnswer(s, answerId));
  const commentsCount = comments?.length ?? 0;

  // Check if current user is the answer author
  const isAnswerAuthor = Boolean(
    answer &&
    currentUserId != null &&
    (answer.author as any) &&
    ((answer.author as any).id ?? (answer.author as any)._id) === currentUserId
  );

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteAnswer(answerId)).unwrap();
      if (res?.success === true) {
        setShowDeleteDialog(false);
        window.location.reload();
      } else {
        const msg = (res && (res.message)) || "Failed to delete answer";
        alert(msg);
      }
    } catch (err: any) {
      console.error("Delete answer failed:", err);
      alert(err?.message || "Failed to delete answer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: "rgba(0,0,0,0.22)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(6px)",
        }}>
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-6 h-6 text-red-600"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Answer?
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-2 text-sm">
              Are you sure you want to delete this answer?
            </p>
            <p className="text-red-600 text-center mb-6 text-sm font-medium">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2.5 rounded-lg ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'} font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md`}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <article className="bg-white rounded shadow-sm p-4 mb-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar user={answer.author as UserShort} size={32} />
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-sm text-gray-800">{answer.author.name}</span>
              <span className="text-xs text-gray-500">
                {new Date((answer as any).answeredAt ?? answer.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showAcceptedBadge && answer.accepted && (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium mr-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Accepted</span>
              </div>
            )}

            {/* Three dots menu - only show for answer author */}
            {isAnswerAuthor && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="More options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        Delete Answer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Body */}
        <div className="prose max-w-none text-sm mb-4">
          <ReactMarkdown>{(answer as any).body ?? answer.body}</ReactMarkdown>
        </div>

        {/* Footer: votes at left, actions at right */}
        <div className="pt-3 border-t flex items-center justify-between">
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
              <span className="font-semibold">{localVotes}</span>
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
            {canAccept && onAccept && !answer.accepted && (
              <button
                onClick={() => onAccept(answerId)}
                className="px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors"
              >
                Accept Answer
              </button>
            )}

            {/* Comments button (opens modal in parent via onOpenComments) */}
            <button
              onClick={() => onOpenComments && onOpenComments(answerId)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors border border-gray-200"
              aria-label="Open comments"
              title={`${commentsCount} comment${commentsCount === 1 ? '' : 's'}`}
            >
              <CommentIcon className="w-4 h-4" />
              <span>Comments</span>
              <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${commentsCount ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                {commentsCount}
              </span>
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
