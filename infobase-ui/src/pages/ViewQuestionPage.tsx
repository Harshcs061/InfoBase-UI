import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import type { RootState, AppDispatch } from "../redux/store";
import DetailedQuestionCard from "../features/Questions/DetailedQuestionCard";
import AnswerCard from "../features/Answers/AnswerCard";
import {
  fetchAnswers,
  selectAnswersForQuestion,
} from "../redux/slices/AnswerSlice";

export default function ViewQuestionPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const questionId = Number(id);

  const [sortBy, setSortBy] = useState<"votes" | "newest" | "oldest">("votes");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    if (questionId) {
      dispatch(fetchAnswers({ questionId }));
    }
  }, [dispatch, questionId]);

  const answers =
    useSelector((s: RootState) => selectAnswersForQuestion(s, questionId)) ?? [];
  const loading = useSelector((s: RootState) => s.answers.loading);

  // Sort answers based on selected option
  const sortedAnswers = [...answers].sort((a: any, b: any) => {
    switch (sortBy) {
      case "votes":
        return (b.score || 0) - (a.score || 0);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleShare = (id: number) => {
    const url = `${window.location.origin}/questions/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const handleEdit = (id: number) => {
    navigate(`/questions/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Questions</span>
        </button>

        {/* Question Detail */}
        <DetailedQuestionCard
          questionId={questionId}
          canEdit={true}
          onShare={handleShare}
          onEdit={handleEdit}
        />

        {/* Answers Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h2>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">
                  Sorted by:{" "}
                  <span className="font-medium">
                    {sortBy === "votes"
                      ? "Highest score"
                      : sortBy === "newest"
                      ? "Newest"
                      : "Oldest"}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {[
                    { value: "votes", label: "Highest score (default)" },
                    { value: "newest", label: "Date created (newest first)" },
                    { value: "oldest", label: "Date created (oldest first)" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as any);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-6 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
              Loading answers...
            </div>
          ) : sortedAnswers.length > 0 ? (
            <div className="space-y-4">
              {sortedAnswers.map((ans: any) => (
                <AnswerCard key={ans.id} answerId={ans.id} canAccept={true} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white border border-gray-200 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Answer
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Know someone who can answer? Share a link to this question via
                email, Twitter, or Facebook.
              </p>
              <textarea
                placeholder="Write your answer here..."
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Please be sure to answer the question. Provide details and share
                  your research!
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium">
                  Post Your Answer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}