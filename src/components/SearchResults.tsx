import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import QuestionCard from '../features/Questions/QuestionCard';
import type { Question, SearchResultsProps } from '../redux/types';


export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  isLoading,
  onUpvote,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No results found for "{query}"
          </h3>
          <p className="text-gray-600 mb-6">
            Try different keywords or check your spelling
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm font-medium text-blue-900 mb-2">Search Tips:</p>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Use specific keywords related to your topic</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Try searching by tags like "React" or "TypeScript"</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Keep your search terms simple and clear</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
        </h2>
      </div>
      <div className="space-y-4">
        {results.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onUpvote={onUpvote}
          />
        ))}
      </div>
    </div>
  );
};
