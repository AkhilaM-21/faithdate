import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, userRes] = await Promise.all([
          API.get("/users/matches"),
          API.get("/users/me")
        ]);
        setMatches(matchesRes.data);
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleUnmatch = async (matchId, event) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to unmatch?")) {
      // API call to unmatch would go here
      // For now, just remove from local state
      setMatches(matches.filter(m => m._id !== matchId));
    }
  };

  if (!currentUser) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 pb-24 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-8 text-center">
        Your Matches
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* SVG Definition for Clip Path */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
              <path d="M0.5,1 C0.5,1,0,0.7,0,0.3 A0.25,0.25,0,0,1,0.5,0.3 A0.25,0.25,0,0,1,1,0.3 C1,0.7,0.5,1,0.5,1 Z" />
            </clipPath>
          </defs>
        </svg>

        {matches.map((match, index) => (
          <div
            key={match._id}
            className="bg-white rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 border border-pink-100"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Colliding Hearts Animation Area */}
            <div className="h-64 bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden flex items-center justify-center">

              {/* Left Heart (Current User) */}
              <div className="absolute left-[15%] z-10 hover:z-30 animate-collide-left transition-all duration-300">
                <div className="transform -rotate-10 transition-transform hover:rotate-0 duration-500">
                  <div className="w-32 h-32 relative drop-shadow-2xl filter">
                    <img
                      src={currentUser.photos?.[0]?.url}
                      className="w-full h-full object-cover bg-pink-200 translate-y-4 scale-110"
                      style={{ clipPath: 'url(#heart-clip)' }}
                      alt="Me"
                    />
                  </div>
                </div>
              </div>

              {/* Right Heart (Match User) */}
              <div className="absolute right-[25%] z-10 hover:z-30 animate-collide-right transition-all duration-300">
                <div className="transform rotate-12 transition-transform hover:rotate-0 duration-500">
                  <div className="w-32 h-32 relative drop-shadow-2xl filter">
                    <img
                      src={match.user?.photos?.[0]?.url}
                      className="w-full h-full object-cover bg-purple-200 translate-y-4 scale-110"
                      style={{ clipPath: 'url(#heart-clip)' }}
                      alt={match.user?.first_name}
                    />
                  </div>
                </div>
              </div>

              {/* Sparkles/Collision Effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="text-4xl animate-ping opacity-75">✨</div>
              </div>

            </div>

            {/* Match Info */}
            <div className="p-5 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {match.user?.first_name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Matched {new Date().toLocaleDateString()}
              </p>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={(e) => handleUnmatch(match._id, e)}
                  className="px-6 py-2 rounded-full border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  Not Interested
                </button>

                <button
                  onClick={() => navigate(`/chat/${match._id}`)}
                  className="px-8 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <span>Chat</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl animate-bounce">
            💔
          </div>
          <h3 className="text-xl font-semibold text-gray-800">No matches yet</h3>
          <p className="text-gray-500 max-w-xs mt-2">
            Don't worry! Keep swiping and you'll find your perfect match soon.
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="mt-6 px-8 py-3 bg-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-pink-700 transition"
          >
            Go to Discover
          </button>
        </div>
      )}
    </div>
  );
}
