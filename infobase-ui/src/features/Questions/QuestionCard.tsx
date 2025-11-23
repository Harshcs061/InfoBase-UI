import React, { useState } from 'react';
import { upvoteQuestionOptimistic } from '../../redux/slices/QuestionsSlice';
import { useAppDispatch } from '../../redux/hooks';
import { ArrowUp, MessageCircle, Clock } from 'lucide-react';
import type { Question } from '../../redux/types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);

  const handleUpvote = (): void => {
    if (!hasUpvoted) {
      dispatch(upvoteQuestionOptimistic(question.id));
      setHasUpvoted(true);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
          {question.author.initials}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-900">{question.author.name}</span>
            <span>asked {question.askedAt}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
            {question.title}
          </h3>
          
          <p className="text-gray-600 mb-4">{question.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleUpvote}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  hasUpvoted ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                {question.upvotes}
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                {question.answers} answers
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {question.lastActivity}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;