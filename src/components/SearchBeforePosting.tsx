import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import { searchQuestions } from '../redux/slices/SearchSlice';
import { X, MessageCircle, ArrowUp, Eye, AlertCircle } from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  descriptionSnippet: string;
  tags: string[];
  votes: number;
  answersCount: number;
  views: number;
  createdAt: string;
  askedBy: {
    name: string;
  };
}

interface QuestionSearchBeforeSubmitProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const QuestionSearchBeforeSubmit: React.FC<QuestionSearchBeforeSubmitProps> = ({
  title,
  onConfirm,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSearching, setIsSearching] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      setIsSearching(true);
      setError(null);

      try {
        const result = await dispatch(
          searchQuestions({
            query: title,
            page: 1,
            limit: 5,
            sortBy: 'relevant',
          })
        ).unwrap();

        setSearchResults(result.questions || []);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search for similar questions');
      } finally {
        setIsSearching(false);
      }
    };

    if (title.trim()) {
      performSearch();
    } else {
      setIsSearching(false);
    }
  }, [title, dispatch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleQuestionClick = (questionId: number) => {
    window.open(`/question/${questionId}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0,0,0,0.22)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Similar Questions Found
              </h2>
              <p className="text-sm text-gray-600">
                Check if your question has already been answered
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Searching for similar questions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!isSearching && !error && searchResults.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Similar Questions Found
              </h3>
              <p className="text-gray-600">
                Your question appears to be unique. You can proceed with posting it!
              </p>
            </div>
          )}

          {!isSearching && !error && searchResults.length > 0 && (
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                We found <span className="font-semibold">{searchResults.length}</span> similar{' '}
                {searchResults.length === 1 ? 'question' : 'questions'}. Please review them before
                posting your question.
              </p>

              {searchResults.map((question) => (
                <div
                  key={question.id}
                  onClick={() => handleQuestionClick(question.id)}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
                >
                  <h3 className="text-base font-semibold text-gray-900 hover:text-indigo-600 mb-2">
                    {question.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {question.descriptionSnippet}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                        +{question.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        <span>{question.votes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{question.answersCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{question.views}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        asked {formatDate(question.createdAt)} by
                      </span>
                      <span className="font-medium text-gray-700">
                        {question.askedBy.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSearching && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {searchResults.length > 0
                ? 'Post Question Anyway'
                : 'Post Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSearchBeforeSubmit;