import { SearchBar } from "../components/SearchBar";
import NotificationToggle from "../components/NotificationToggle";
import ProfileToggle from "../components/ProfileToggle";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          Infobase
        </button>
      </div>
      <div className="flex-1 flex justify-center px-6">
        <div className="w-full max-w-3xl">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search questions..."
            showRecentSearches={true}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <NotificationToggle />
        </div>

        <ProfileToggle
          name="Vivek Napit"
          avatarUrl={null}
          onViewProfile={() => {
            console.log("view profile");
          }}
          onLogout={() => {
            console.log("logout");
          }}
        />
      </div>
    </div>
  );
}