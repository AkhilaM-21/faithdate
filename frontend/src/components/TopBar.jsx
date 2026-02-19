import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import { getSocket } from "../services/socket";

const TopBar = ({ onFilterClick, user }) => {
  const location = useLocation();
  const isDiscover = location.pathname === "/discover";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial unread count
    const fetchCount = async () => {
      try {
        const res = await API.get("/notifications/unread-count");
        setUnreadCount(res.data.unreadCount);
      } catch {
        // silently fail
      }
    };
    fetchCount();

    // Listen for real-time notifications
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = () => {
        setUnreadCount(prev => prev + 1);
      };
      socket.on("newNotification", handleNewNotification);
      return () => socket.off("newNotification", handleNewNotification);
    }
  }, []);

  // Reset count when visiting notifications page
  useEffect(() => {
    if (location.pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-[200] flex items-center justify-between px-4">
      {/* Left: Filter Icon (Only on Discover) */}
      <div className="w-10">
        {isDiscover && (
          <button onClick={onFilterClick} className="p-2 transition-transform hover:scale-110 active:scale-95">
            <img src="/assets/icons/icon-filter.png" alt="Filters" className="w-6 h-6 object-contain opacity-70 hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Center: Logo */}
      <div className="text-2xl font-bold text-pink-600 tracking-tight">
        FaithDate
      </div>

      {/* Right: Notification Bell + Profile */}
      <div className="flex items-center gap-1">
        {/* Notification Bell */}
        <Link to="/notifications" className="relative p-2 transition-transform hover:scale-110 active:scale-95">
          <img src="/assets/icons/icon-bell.png" alt="Notifications" className="w-6 h-6 object-contain opacity-70 hover:opacity-100 transition-opacity" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce shadow-md">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <Link to="/profile" className="p-2 text-gray-600 hover:text-pink-600 transition-colors">
          {user?.photos?.[0]?.url ? (
            <img src={user.photos[0].url} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <img src="/assets/icons/nav-profile.png" alt="Profile" className="w-8 h-8 object-contain opacity-70 hover:opacity-100 transition-opacity" />
          )}
        </Link>
      </div>
    </header>
  );
};

export default TopBar;