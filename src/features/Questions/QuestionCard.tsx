import React from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import type { Question } from '../../redux/types';
import { useNavigate } from 'react-router-dom';

interface QuestionCardProps {
  question: Question;
  onUpvote: (questionId: number) => void;
}

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    // Format like: Dec 10, 2025
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpvote }) => {
  const navigate = useNavigate();

  const handleQuestionClick = () => {
    navigate(`/question/${question.id}`);
  };

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpvote(question.id);
  };

  return (
    <div
      className="w-full bg-white rounded-lg border border-gray-200 p-4 md:p-6 lg:p-8 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleQuestionClick}
    >
      {/* Author Info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm md:text-base">
          {question.askedBy.name.charAt(0)}
        </div>
        <span className="text-gray-700 font-medium text-sm md:text-base">{question.askedBy.name}</span>
        <span className="text-gray-500 text-xs md:text-sm">asked {formatDate(question.createdAt)}</span>
      </div>

      {/* Question Title */}
      <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer">
        {question.title}
      </h3>

      {/* Question Description */}
      <p className="text-gray-600 mb-4 line-clamp-2 md:line-clamp-3 lg:line-clamp-none">
        {question.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs md:text-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base text-gray-600">
        <button
          onClick={handleUpvoteClick}
          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
        >
          <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium">{question.votes}</span>
        </button>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          <span>{question.answer_count} answers</span>
        </div>
        {/* Clock icon and lastActivity removed as requested */}
      </div>
    </div>
  );
};

export default QuestionCard;
