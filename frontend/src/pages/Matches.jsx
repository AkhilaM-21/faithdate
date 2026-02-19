import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Matches() {
  const { addToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [likesData, setLikesData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, userRes, likesRes] = await Promise.all([
          API.get("/users/matches"),
          API.get("/users/me"),
          API.get("/users/likes")
        ]);
        setMatches(matchesRes.data);
        setCurrentUser(userRes.data);
        setLikesData(likesRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleUnmatch = async (matchId, event) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to unmatch? This cannot be undone.")) {
      try {
        await API.post(`/users/matches/${matchId}/unmatch`);
        setMatches(matches.filter(m => m._id !== matchId));
      } catch (err) {
        console.error("Unmatch failed", err);
        addToast("Failed to unmatch. Please try again.", "error");
      }
    }
  };

  const handleReport = async (match, event) => {
    event.stopPropagation();
    const reason = window.prompt("Why are you reporting this user? (e.g., span, harassment)");
    if (reason) {
      try {
        await API.post("/users/report", {
          reportedUserId: match.user._id,
          reason
        });
        addToast("User reported. Thank you for keeping our community safe.", "success");
        // Optional: Auto-unmatch after report
        handleUnmatch(match._id, event);
      } catch (err) {
        console.error("Report failed", err);
        addToast("Failed to report user.", "error");
      }
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (!currentUser) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 pb-24 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-8 text-center">
        Your Matches
      </h1>



      <div className="max-w-6xl mx-auto px-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          Connected Matches
        </h2>
      </div>

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
                Matched {new Date(match.lastMessageTime).toLocaleDateString()}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/chat/${match._id}`)}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Chat</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={(e) => handleUnmatch(match._id, e)}
                    className="flex-1 py-2 rounded-full border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 hover:text-red-500 transition-colors"
                  >
                    Unmatch
                  </button>
                  <button
                    onClick={(e) => handleReport(match, e)}
                    className="flex-1 py-2 rounded-full border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 mb-10 text-center">
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

      {/* ── Who Liked Me Section (Moved Below) ── */}
      <div className="max-w-6xl mx-auto mt-10 mb-10 px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Who Liked You
          </h2>

          {likesData ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-pink-600">{likesData.totalLikes}</span>
                <span className="text-gray-500 text-sm">people liked you</span>
              </div>

              {likesData.tier === "gold" || likesData.tier === "platinum" || likesData.isPremium ? (
                likesData.likes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {likesData.likes.map((user, i) => (
                      <div key={i} className="flex flex-col items-center bg-gray-50 p-3 rounded-xl hover:bg-gold-50 transition cursor-default">
                        <img
                          src={user.photos?.[0]?.url || "https://via.placeholder.com/80"}
                          className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400 shadow-sm mb-2"
                          alt={user.first_name}
                        />
                        <span className="font-bold text-sm text-gray-800">{user.first_name}</span>
                        <span className="text-xs text-gray-500">{calculateAge(user.date_of_birth)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No new likes yet. Keep your profile updated!</p>
                )
              ) : (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-2xl">🏆</div>
                  <p className="text-lg font-bold text-yellow-800 mb-1">See Who Liked You</p>
                  <p className="text-sm text-yellow-700 max-w-md mb-4">
                    {likesData.totalLikes > 0
                      ? `Upgrade to Gold to reveal ${likesData.totalLikes} people who already liked you.`
                      : "Upgrade to Gold to see who likes you first!"}
                  </p>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform">
                    Upgrade to Gold
                  </button>

                  {/* Blurred Preview Stub */}
                  <div className="flex gap-2 mt-6 opacity-50 blur-sm pointer-events-none select-none">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full bg-gray-300"></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Loading likes...</p>
          )}
        </div>
      </div>


    </div>
  );
}
