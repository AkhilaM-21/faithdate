import { useEffect, useState, useRef, createRef } from "react";
import { useOutletContext } from "react-router-dom";
import TinderCard from "react-tinder-card";
import API from "../services/api";

export default function Discover() {
  const { filters } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const [currentAction, setCurrentAction] = useState(null); // 'like', 'dislike', or 'favorite'
  const [removingCard, setRemovingCard] = useState(false); // Track card removal animation
  const childRefs = useRef([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.minAge) params.append("minAge", filters.minAge);
        if (filters.maxAge) params.append("maxAge", filters.maxAge);
        if (filters.denomination) params.append("denomination", filters.denomination);
        if (filters.churchInvolvement) params.append("church_involvement", filters.churchInvolvement);
        if (filters.relationshipGoal) params.append("relationship_goal", filters.relationshipGoal);
        if (filters.interests) params.append("interests", filters.interests);
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.radius) params.append("radius", filters.radius);

        const res = await API.get(`/users/discover?${params.toString()}`);
        setUsers(res.data);
        childRefs.current = res.data.map(() => createRef());
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();
  }, [filters]);

  const swiped = async (direction, userId) => {
    if (direction === "right") {
      try {
        const res = await API.post("/users/like", { userId });
        if (res.data.matched) {
          alert("It's a Match ❤️");
        }
      } catch (err) {
        console.error("Like failed", err);
      }
    } else if (direction === "up") {
      const user = users.find(u => u._id === userId);
      if (user) {
        setSelectedUser(user);
      }
      return;
    }

    setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
  };

  const swipe = async (dir) => {
    if (users.length === 0) return;

    const currentIndex = users.length - 1;
    const canSwipe = childRefs.current[currentIndex]?.current && dir !== 'up';

    if (canSwipe) {
      await childRefs.current[currentIndex].current.swipe(dir);
    }
  };

  const handleButtonAction = async (action) => {
    if (users.length === 0) return;

    const currentUser = users[users.length - 1];

    // Show animation immediately
    setCurrentAction(action);

    if (action === "like" || action === "favorite") {
      try {
        const res = await API.post("/users/like", {
          userId: currentUser._id,
          superLike: action === "favorite"
        });
        if (res.data.matched) {
          // Alert user after animation delay so it doesn't block immediately
          setTimeout(() => alert("It's a Match ❤️"), 500);
        }
      } catch (err) {
        console.error("Action failed", err);
      }
    }

    // Wait for animation to play a bit (800ms) before sliding card away
    setTimeout(() => {
      setRemovingCard(true); // Trigger slide out

      // Wait for slide animation (500ms) then remove user from DOM
      setTimeout(() => {
        setRemovingCard(false);
        setCurrentAction(null);
        setUsers(prevUsers => prevUsers.filter(u => u._id !== currentUser._id));
      }, 500);
    }, 800);
  };

  const handleCardClick = (user, event) => {
    if (event.target.closest('.action-buttons')) {
      return;
    }
    setSelectedUser(user);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleButtonAction('favorite');
    }
    setLastTap(now);
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-gray-50">



      {/* Card Stack */}
      {!selectedUser && (
        <div className="flex justify-center items-center h-full mt-4 pb-28">
          {users.length === 0 && (
            <div className="text-center text-gray-400 p-10">
              <p className="text-xl">No more profiles.</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          )}


          {/* Animation Overlay - Matches Card Dimensions */}
          {currentAction && (
            <div className="absolute w-[90vw] max-w-sm h-[70vh] z-[200] pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(10)].map((_, i) => {
                const size = 24; // Fixed small size
                const delay = i * 0.1;

                // Determine starting position based on action
                let baseLeft;
                if (currentAction === 'like') baseLeft = 80; // Right
                else if (currentAction === 'dislike') baseLeft = 20; // Left
                else baseLeft = 50; // Middle (Favorite)

                const startLeft = baseLeft + (Math.random() * 20 - 10);

                return (
                  <div
                    key={i}
                    className="absolute bottom-0"
                    style={{
                      left: `${startLeft}%`,
                      animation: `floatUp 1.5s ease-out ${delay}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <div>
                      {currentAction === 'like' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ec4899" className="drop-shadow-xl">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      )}
                      {currentAction === 'dislike' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" className="drop-shadow-xl">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      )}
                      {currentAction === 'favorite' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#fbbf24" className="drop-shadow-xl">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative w-[90vw] max-w-sm h-[70vh]">
            {users.slice(-3).reverse().map((user, reverseIndex) => {
              const actualIndex = users.indexOf(user);
              const isTopCard = reverseIndex === 0;

              return (
                <div
                  key={user._id}
                  className={`absolute inset-0 ${isTopCard && removingCard ? 'animate-slide-out-left' : ''}`}
                  style={{
                    zIndex: 100 - reverseIndex,
                    transform: `scale(${1 - reverseIndex * 0.05}) translateY(${-reverseIndex * 10}px)`,
                    opacity: 1,
                    pointerEvents: isTopCard ? 'auto' : 'none',
                  }}
                >
                  <TinderCard
                    ref={childRefs.current[actualIndex]}
                    className="swipe"
                    onSwipe={(dir) => swiped(dir, user._id)}
                    preventSwipe={["down"]}
                    swipeRequirementType="position"
                    swipeThreshold={50}
                  >
                    <div
                      className="relative w-[90vw] max-w-sm h-[70vh] bg-white shadow-2xl rounded-3xl cursor-pointer"
                      onClick={(e) => handleCardClick(user, e)}
                      onTouchEnd={handleDoubleTap}
                      onWheel={(e) => {
                        if (e.deltaY < 0 && isTopCard) {
                          // Scrolling up - open profile
                          setSelectedUser(user);
                        }
                      }}
                    >



                      {/* Animation Overlay - Inside Card Component */}
                      {isTopCard && currentAction && (
                        <div className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-3xl">
                          {[...Array(10)].map((_, i) => {
                            const size = 24; // Fixed small size
                            const delay = i * 0.1;

                            // Determine starting position based on action
                            let baseLeft;
                            if (currentAction === 'like') baseLeft = 80; // Right
                            else if (currentAction === 'dislike') baseLeft = 20; // Left
                            else baseLeft = 50; // Middle (Favorite)

                            const startLeft = baseLeft + (Math.random() * 20 - 10);

                            return (
                              <div
                                key={i}
                                className="absolute bottom-0"
                                style={{
                                  left: `${startLeft}%`,
                                  animation: `floatUp 1.5s ease-out ${delay}s forwards`,
                                  opacity: 0,
                                }}
                              >
                                <div>
                                  {currentAction === 'like' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ec4899" className="drop-shadow-xl">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                  )}
                                  {currentAction === 'dislike' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" className="drop-shadow-xl">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  )}
                                  {currentAction === 'favorite' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#fbbf24" className="drop-shadow-xl">
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="w-full h-full overflow-hidden rounded-3xl relative">

                        <div
                          className="h-3/4 w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${user.photos?.[0]?.url || 'https://via.placeholder.com/400'})` }}
                        >
                          <div className="absolute inset-0  opacity-50 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                        </div>

                        <div className="absolute bottom-0 w-full p-5 text-white bg-black/30 backdrop-blur-md border-t border-white/20">
                          {/* Match Score Badge */}
                          <div className="absolute top-4 right-5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-lg flex items-center gap-1.5">
                            <span className="text-pink-400 text-sm">❤️</span>
                            <span className="text-white font-bold text-xs tracking-wide">
                              {user.matchScore || 60}% Match
                            </span>
                          </div>

                          <h2 className="text-3xl font-bold drop-shadow-md">
                            {user.first_name}, {calculateAge(user.date_of_birth)}
                          </h2>

                          <div className="flex flex-wrap gap-2 mt-2 mb-2">
                            {user.denomination && (
                              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                                {user.denomination}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-200 line-clamp-2">
                            {user.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TinderCard>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {users.length > 0 && !selectedUser && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-6 z-[100] action-buttons pointer-events-auto">
          <button
            onClick={() => handleButtonAction('dislike')}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform border-2 border-red-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <button
            onClick={() => handleButtonAction('favorite')}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-transform border-2 border-blue-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>

          <button
            onClick={() => handleButtonAction('like')}
            className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      )}

      {/* Full Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-slide-up">
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-4 right-4 z-50 bg-black/20 p-2 rounded-full text-white hover:bg-black/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          <div>
            <div className="h-[50vh] w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedUser.photos?.[0]?.url})` }}>
              <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h1 className="text-4xl font-bold text-white">
                  {selectedUser.first_name}, {calculateAge(selectedUser.date_of_birth)}
                </h1>
                <p className="text-white/90 mt-1">{selectedUser.location}</p>
              </div>
            </div>

            <div className="p-6 space-y-6 pb-24">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedUser.bio}</p>
              </section>

              <section className="grid grid-cols-2 gap-4">
                <div className="bg-pink-50 p-4 rounded-xl">
                  <p className="text-xs text-pink-500 font-bold uppercase">Denomination</p>
                  <p className="font-semibold text-gray-800">{selectedUser.denomination}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <p className="text-xs text-pink-500 font-bold uppercase">Involvement</p>
                  <p className="font-semibold text-gray-800">{selectedUser.church_involvement}</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Looking For</h3>
                <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-xl">💍</span>
                  <span className="font-medium text-gray-700">{selectedUser.relationship_goal}</span>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.interests?.map((interest, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </section>

              {selectedUser.photos?.slice(1).map((photo, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-md">
                  <img src={photo.url} alt="User" className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}