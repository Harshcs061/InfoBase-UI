import { Search } from "lucide-react";
import { Bell } from "lucide-react";

export default function TopNavbar() {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-sm">
          Q&A
        </button>
      </div>

      <div className="flex-1 flex justify-center px-6">
        <div className="w-full max-w-3xl bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full bg-transparent outline-none text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
        </div>

        <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold cursor-pointer">
          JD
        </div>
      </div>
    </div>
  );
}
