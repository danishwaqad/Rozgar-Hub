import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs: Driver, Engineer, Dubai..."
        className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-white/30 bg-white/95 backdrop-blur-sm focus:border-white focus:outline-none focus:ring-4 focus:ring-white/30 text-lg text-gray-800 placeholder:text-gray-500 shadow-xl"
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white p-3.5 rounded-xl hover:shadow-lg hover:scale-105 transition"
      >
        <FaSearch className="text-lg" />
      </button>
    </form>
  );
}