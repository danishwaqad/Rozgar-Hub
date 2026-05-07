import { Link } from 'react-router-dom';
import { FaBriefcase, FaBars } from 'react-icons/fa';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg group-hover:scale-110 transition duration-300">
              <FaBriefcase className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                RozgarHub<span className="text-green-600">.pk</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Find Your Dream Job</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">Home</Link>
            <Link to="/category/govt-pk" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">Govt Jobs</Link>
            <Link to="/category/international" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">Dubai Jobs</Link>
            <Link to="/scholarships" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">Scholarships</Link>
            <Link to="/about-us" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">About</Link>
            <Link to="/contact-us" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">Contact</Link>
            <Link to="/faq" className="text-gray-700 hover:text-green-600 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-50">FAQ</Link>
          </div>

          <button 
            onClick={() => setMobileMenu(!mobileMenu)} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaBars className="text-2xl text-gray-700" />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-semibold">Home</Link>
              <Link to="/category/govt-pk" className="text-gray-700 hover:text-green-600 font-semibold">Govt Jobs</Link>
              <Link to="/category/international" className="text-gray-700 hover:text-green-600 font-semibold">Dubai Jobs</Link>
              <Link to="/scholarships" className="text-gray-700 hover:text-green-600 font-semibold">Scholarships</Link>
              <Link to="/about-us" className="text-gray-700 hover:text-green-600 font-semibold">About</Link>
              <Link to="/contact-us" className="text-gray-700 hover:text-green-600 font-semibold">Contact</Link>
              <Link to="/faq" className="text-gray-700 hover:text-green-600 font-semibold">FAQ</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}