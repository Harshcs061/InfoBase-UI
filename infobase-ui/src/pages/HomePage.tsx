import React, { useEffect, useState } from 'react';
import { fetchQuestions } from '../redux/slices/QuestionsSlice';
import { setSortBy } from '../redux/slices/FilterSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import QuestionCard from '../features/Questions/QuestionCard';
import { Filter, Plus } from 'lucide-react';
import type { SortOption } from '../redux/types';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  
  const sortBy = useAppSelector(state => state.filters.sortBy);
  const loading = useAppSelector(state => state.questions.isLoading);
  const questions = useAppSelector(state => state.questions.items);
  const error = useAppSelector(state => state.questions.error);
  
  const sortOptions: SortOption[] = ['Most Upvoted', 'Most Recent', 'Most Answered'];

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  const handleSortChange = (option: SortOption): void => {
    dispatch(setSortBy(option));
    setShowSortDropdown(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchQuestions())}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
            <p className="text-gray-600 mt-1">{questions.length} questions</p>
          </div>
          
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus className="w-5 h-5" />
            Ask a Question
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
            >
              <span className="text-gray-700">{sortBy}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === option ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Filter by Tags</span>
          </button>
        </div>

        {/* Questions list */}
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No questions available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;