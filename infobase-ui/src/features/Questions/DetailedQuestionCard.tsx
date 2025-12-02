import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  Bookmark, 
  Share2, 
  Flag,
  Clock,
  MessageSquare 
} from "lucide-react";
import type { AppDispatch } from "../../redux/store";
import type { Question, User } from "../../redux/types";
import {
  upvoteQuestion,
  upvoteQuestionOptimistic,
  fetchQuestionById,
} from "../../redux/slices/QuestionsSlice";

type Props = {
  questionId: number;
  canEdit?: boolean;
  onShare?: (id: number) => void;
  onEdit?: (id: number) => void;
};

const Avatar: React.FC<{ user: User; size?: number }> = ({ user, size = 32 }) => {
  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "U";
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded bg-blue-600 flex items-center justify-center text-xs font-medium text-white overflow-hidden"
    >
      {(user as any)?.avatar || (user as any)?.avatarUrl ? (
        <img
          src={(user as any).avatar || (user as any).avatarUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default function DetailedQuestionCard({
  questionId,
  canEdit = false,
  onShare,
  onEdit,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    dispatch(fetchQuestionById(questionId as number))
      .unwrap()
      .then((payload: any) => {
        if (!mounted) return;
        setQuestion(payload.question ?? null);
      })
      .catch((err: any) => {
        console.error("fetchQuestionById error:", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load question");
        setQuestion(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, questionId]);

  if (loading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded text-sm text-gray-500">
        Loading question...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded text-sm text-red-600">
        Error loading question: {error}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded text-sm text-gray-500">
        Question not found.
      </div>
    );
  }

  const handleUpvote = async () => {
    dispatch(upvoteQuestionOptimistic(questionId));
    const res = await dispatch(upvoteQuestion(questionId as number))
      .unwrap()
      .catch((err: any) => {
        console.error("Upvote thunk failed:", err);
        return { error: err };
      });

    if ((res as any)?.error) {
      dispatch(fetchQuestionById(questionId as number));
    }
  };

  const handleDownvote = () => {
    console.log("Downvote functionality to be implemented");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg">
      <div className="flex">
        {/* Left Sidebar - Voting */}
        <div className="flex flex-col items-center gap-2 p-4 border-r border-gray-200 bg-gray-50">
          <button
            onClick={handleUpvote}
            className="p-1 hover:bg-orange-100 rounded transition-colors"
            aria-label="upvote"
          >
            <ArrowBigUp className="w-8 h-8 text-gray-600 hover:text-orange-600" />
          </button>

          <div className="text-xl font-bold text-gray-800 my-1">
            {(question as any).upvotes ?? question.upvotes}
          </div>

          <button
            onClick={handleDownvote}
            className="p-1 hover:bg-orange-100 rounded transition-colors"
            aria-label="downvote"
          >
            <ArrowBigDown className="w-8 h-8 text-gray-600 hover:text-orange-600" />
          </button>

          <button
            onClick={handleBookmark}
            className={`p-1 mt-2 hover:bg-yellow-100 rounded transition-colors ${
              isBookmarked ? 'text-yellow-600' : 'text-gray-600'
            }`}
            aria-label="bookmark"
          >
            <Bookmark className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {question.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Asked {formatDate(question.askedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>Modified {formatDate(question.lastActivity)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{question.answers}</span>
              <span>times viewed</span>
            </div>
          </div>

          {/* Question Body */}
          <div className="prose max-w-none mb-6">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 text-gray-800 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
                code: ({ inline, children, ...props }: any) =>
                  inline ? (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
                      <code className="text-sm font-mono text-gray-800" {...props}>
                        {children}
                      </code>
                    </pre>
                  ),
              }}
            >
              {(question as any).description ?? question.description}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons & Author Info */}
          <div className="flex items-start justify-between pt-4 border-t border-gray-200">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onShare?.(questionId)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {canEdit && (
                <button
                  onClick={() => onEdit?.(questionId)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Edit
                </button>
              )}

              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Flag className="w-4 h-4" />
                Flag
              </button>
            </div>

            {/* Author Card */}
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-2">
                asked {formatDate(question.askedAt)}
              </div>
              <div className="flex items-center gap-2">
                <Avatar user={question.author as User} size={32} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-700 hover:text-blue-800 cursor-pointer">
                    {question.author?.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">1,250</span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>5</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>12</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}