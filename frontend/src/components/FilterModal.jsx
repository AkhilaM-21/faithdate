import React, { useState } from "react";

const FilterModal = ({ onClose, currentFilters, onApply }) => {
  const [filters, setFilters] = useState(currentFilters);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center">
      <div className="w-full sm:w-96 bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Filters</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range ({filters.minAge} - {filters.maxAge})</label>
            <div className="flex items-center gap-4 px-2">
              <input type="range" name="minAge" min="18" max="100" value={filters.minAge} onChange={handleChange} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600" />
              <input type="range" name="maxAge" min="18" max="100" value={filters.maxAge} onChange={handleChange} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600" />
            </div>
          </div>

          {/* Denomination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Denomination</label>
            <select name="denomination" value={filters.denomination} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Any</option>
              <option value="Catholic">Catholic</option>
              <option value="Protestant">Protestant</option>
              <option value="Orthodox">Orthodox</option>
              <option value="Non-denominational">Non-denominational</option>
            </select>
          </div>

          {/* Church Involvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Church Involvement</label>
            <select name="churchInvolvement" value={filters.churchInvolvement} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Any</option>
              <option value="Very Active">Very Active</option>
              <option value="Moderate">Moderate</option>
              <option value="Occasional">Occasional</option>
            </select>
          </div>

          {/* Relationship Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Goal</label>
            <select name="relationshipGoal" value={filters.relationshipGoal} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Any</option>
              <option value="Marriage">Marriage</option>
              <option value="Long-term">Long-term Relationship</option>
              <option value="Dating">Dating</option>
            </select>
          </div>

          {/* Hobbies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies</label>
            <input type="text" name="interests" value={filters.interests || ""} onChange={handleChange} placeholder="Hiking, Reading..." className="w-full p-2 border rounded-lg" />
          </div>

          {/* Interested In (Gender) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, gender: 'Male' })}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${filters.gender === 'Male' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500 hover:border-pink-200'}`}
              >
                <img src="https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png" alt="Male" className="w-8 h-8 mb-2" />
                <span className="font-medium">Male</span>
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, gender: 'Female' })}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${filters.gender === 'Female' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500 hover:border-pink-200'}`}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/3895/3895366.png" alt="Female" className="w-8 h-8 mb-2" />
                <span className="font-medium">Female</span>
              </button>
            </div>
          </div>

          {/* Location Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance ({filters.radius || 50} km)</label>
            <input type="range" name="radius" min="5" max="500" value={filters.radius || 50} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600" />
          </div>
        </div>

        <button type="button" onClick={handleApply} className="w-full mt-8 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition shadow-md">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterModal;