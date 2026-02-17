import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import FilterModal from "./FilterModal";

const Layout = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 50,
    denomination: "",
    churchInvolvement: "",
    relationshipGoal: "",
    interests: "",
    radius: 50,
    gender: "",
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
      <TopBar onFilterClick={() => setIsFilterOpen(true)} />

      <main className="flex-1 pt-16 pb-16 overflow-y-auto scroll-smooth relative">
        <Outlet context={{ filters }} />
      </main>

      <BottomNav />

      {/* Backdrop Blur Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {isFilterOpen && (
        <FilterModal currentFilters={filters} onApply={handleApplyFilters} onClose={() => setIsFilterOpen(false)} />
      )}
    </div>
  );
};

export default Layout;