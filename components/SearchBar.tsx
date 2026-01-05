import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative z-10 px-4 sm:px-0">
      <div className="relative group transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative flex items-center bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(251,113,133,0.3)] border-2 border-transparent hover:border-rose-100 transition-all duration-300 p-2">
          <div className="pl-4 text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full py-4 px-4 rounded-[2rem] focus:outline-none text-gray-700 placeholder-gray-400 text-lg font-medium bg-transparent"
            placeholder="วันนี้อยากไปไหนดีน้า?..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <div className="pr-1">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`h-12 px-8 rounded-[1.5rem] font-bold text-white transition-all duration-300 flex items-center justify-center shadow-lg ${
                isLoading || !query.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 hover:scale-105 shadow-rose-200'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                </div>
              ) : (
                'ค้นหาเลย'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;