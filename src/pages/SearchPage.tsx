import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Search } from 'lucide-react';
import type { RootState, AppDispatch } from '../redux/store';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { upvoteQuestion } from '../redux/slices/QuestionsSlice';

export default function SearchPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [isSearching, setIsSearching] = useState(false);
  const questions = useSelector((state: RootState) => state.questions.items);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    
    return questions.filter((question) => {
      if (question.title.toLowerCase().includes(lowerQuery)) return true;
      if (question.description.toLowerCase().includes(lowerQuery)) return true;
      if (question.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
      if (question.author.name.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
  }, [query, questions]);

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [query]);

  const handleSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleUpvote = (questionId: number) => {
    dispatch(upvoteQuestion(questionId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Questions</span>
        </button>
        {query && (
          <SearchResults
            results={searchResults}
            query={query}
            isLoading={isSearching}
            onUpvote={handleUpvote}
          />
        )}
        {!query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search for questions
            </h3>
            <p className="text-gray-600">
              Enter keywords to find relevant questions and answers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}