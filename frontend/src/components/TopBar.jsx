import React from "react";
import { Link, useLocation } from "react-router-dom";

const TopBar = ({ onFilterClick }) => {
  const location = useLocation();
  const isDiscover = location.pathname === "/discover";

  return (
    <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-50 flex items-center justify-between px-4">
      {/* Left: Filter Icon (Only on Discover) */}
      <div className="w-10">
        {isDiscover && (
          <button onClick={onFilterClick} className="p-2 text-gray-600 hover:text-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Center: Logo */}
      <div className="text-2xl font-bold text-pink-600 tracking-tight">
        FaithDate
      </div>

      {/* Right: Profile Icon */}
      <div className="w-10 flex justify-end">
        <Link to="/profile" className="p-2 text-gray-600 hover:text-pink-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;