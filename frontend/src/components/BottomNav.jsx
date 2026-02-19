import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = ({ user }) => {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)] transition-all duration-300">
      <div className="flex justify-around items-center h-16 w-full">
        <NavItem
          to="/discover"
          label="Discover"
          icon="/assets/icons/nav-discover.png"
          activeIcon="/assets/icons/nav-discover-active.png"
        />

        <NavItem
          to="/matches"
          label="Matches"
          icon="/assets/icons/nav-matches.png"
          activeIcon="/assets/icons/nav-matches-active.png"
        />

        <NavItem
          to="/messages"
          label="Messages"
          icon="/assets/icons/nav-chat.png"
          activeIcon="/assets/icons/nav-chat-active.png"
        />

        <NavItem
          to="/community"
          label="Community"
          icon="/assets/icons/nav-community.png"
          activeIcon="/assets/icons/nav-community-active.png"
        />
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, activeIcon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 group`
    }
  >
    {({ isActive }) => (
      <>
        <div className="relative w-6 h-6">
          <img
            src={isActive ? activeIcon : icon}
            alt={label}
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
          />
        </div>
        <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-pink-600 font-bold" : "text-gray-400 group-hover:text-gray-600"}`}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

export default BottomNav;