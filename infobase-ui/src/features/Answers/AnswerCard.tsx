import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { ArrowBigUp, ArrowBigDown, Share2, Flag, Check } from "lucide-react";
import type { RootState } from "../../redux/store";
import type { Answer, User } from "../../redux/types";
import {
  selectAnswerById,
  voteOptimistic,
  voteAnswer,
} from "../../redux/slices/AnswerSlice";

type Props = {
  answerId: string | number;
  showAcceptedBadge?: boolean;
  canAccept?: boolean;
  onAccept?: (answerId: string | number) => void;
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

export default function AnswerCard({
  answerId,
  showAcceptedBadge = true,
  canAccept = false,
  onAccept,
}: Props) {
  const dispatch = useDispatch();
  const answer = useSelector((s: RootState) =>
    selectAnswerById(s, answerId)
  ) as Answer | undefined;

  if (!answer) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded text-sm text-gray-500">
        Answer not found.
      </div>
    );
  }

  const handleVote = async (delta: number) => {
    dispatch(voteOptimistic({ answerId, delta }));
    const res = await (dispatch as any)(voteAnswer({ answerId, delta }));

    if (res?.error) {
      dispatch(voteOptimistic({ answerId, delta: -delta }));
      console.error("Vote failed:", res.error);
    }
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
    <article
      className={`bg-white border border-gray-200 rounded-lg ${
        answer.isAccepted ? "border-green-200 border-l-4 border-l-green-500" : ""
      }`}
    >
      <div className="flex">
        {/* Left Sidebar - Voting */}
        <div className="flex flex-col items-center gap-2 p-4 border-r border-gray-200 bg-gray-50">
          <button
            onClick={() => handleVote(1)}
            className="p-1 hover:bg-orange-100 rounded transition-colors"
            aria-label="upvote"
          >
            <ArrowBigUp className="w-8 h-8 text-gray-600 hover:text-orange-600" />
          </button>

          <div className="text-xl font-bold text-gray-800 my-1">
            {answer.score}
          </div>

          <button
            onClick={() => handleVote(-1)}
            className="p-1 hover:bg-orange-100 rounded transition-colors"
            aria-label="downvote"
          >
            <ArrowBigDown className="w-8 h-8 text-gray-600 hover:text-orange-600" />
          </button>

          {canAccept && (
            <button
              onClick={() => onAccept?.(answerId)}
              className={`p-1 mt-2 rounded transition-colors ${
                answer.isAccepted
                  ? "bg-green-100 text-green-600"
                  : "hover:bg-green-100 text-gray-400 hover:text-green-600"
              }`}
              aria-label="accept answer"
            >
              <Check className="w-8 h-8" strokeWidth={3} />
            </button>
          )}

          {!canAccept && answer.isAccepted && (
            <div className="p-1 mt-2 bg-green-100 rounded">
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Accepted Badge */}
          {showAcceptedBadge && answer.isAccepted && (
            <div className="flex items-center gap-2 mb-4 text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
              <Check className="w-5 h-5" strokeWidth={2.5} />
              <span className="font-medium text-sm">Accepted Answer</span>
            </div>
          )}

          {/* Answer Body */}
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
              {answer.body}
            </ReactMarkdown>
          </div>

          {/* Action Buttons & Author Info */}
          <div className="flex items-start justify-between pt-4 border-t border-gray-200">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>

              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                Edit
              </button>

              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Flag className="w-4 h-4" />
                Flag
              </button>
            </div>

            {/* Author Card */}
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-2">
                answered {formatDate(answer.createdAt)}
              </div>
              <div className="flex items-center gap-2">
                <Avatar user={answer.author as User} size={32} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-700 hover:text-blue-800 cursor-pointer">
                    {answer.author?.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">890</span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>3</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>8</span>
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