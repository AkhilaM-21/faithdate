import { useEffect, useState, useRef, createRef, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import TinderCard from "react-tinder-card";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

// MOCK PLAN & LIMITS
const USER_PLAN = 'free'; // 'free' or 'premium'
const ACTION_LIMITS = {
  free: { like: 10, superlike: 1, restore: 0, favorite: 100 }, // Fav limit optional 100/day
  premium: { like: Infinity, superlike: Infinity, restore: Infinity, favorite: Infinity }
};

export default function Discover() {
  const { addToast } = useToast();
  const { filters } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const [currentAction, setCurrentAction] = useState(null);
  const [removingCard, setRemovingCard] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(5);
  const [showReward, setShowReward] = useState(false);
  const [history, setHistory] = useState([]); // Track swiped users for Restore

  // Usage State
  const [dailyUsage, setDailyUsage] = useState({ like: 0, superlike: 0, restore: 0, favorite: 0 });

  // Refs
  const childRefs = useMemo(() => Array(users.length).fill(0).map(i => createRef()), [users.length]);
  const clickTimeoutRef = useRef(null);
  const dragRef = useRef({ startX: 0, currentX: 0, startY: 0, isTwoFinger: false });
  const touchStartTime = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Overlay Refs
  const overlayLikeRef = useRef(null);
  const overlayNopeRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();
  }, [filters]);

  // ─── DAILY REWARD CHECK ──────────────────────────────────────
  useEffect(() => {
    const lastClaim = localStorage.getItem('last_daily_reward');
    const today = new Date().toDateString();
    
    if (lastClaim !== today) {
        const timer = setTimeout(() => setShowReward(true), 1500);
        return () => clearTimeout(timer);
    }
  }, []);

  const handleClaimReward = () => {
      localStorage.setItem('last_daily_reward', new Date().toDateString());
      setShowReward(false);
      addToast("Daily Reward Unlocked: 1 Super Like 🎁", "success");
  };

  // ─── LIMIT CHECKER ───────────────────────────────────────────
  const checkLimit = (actionType) => {
    if (actionType === 'dislike') return true; // Unlimited

    const limit = ACTION_LIMITS[USER_PLAN][actionType];
    const used = dailyUsage[actionType] || 0;

    if (used >= limit) {
      // Trigger Shake
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Haptic
      if (navigator.vibrate) navigator.vibrate(200);

      // Specific Toasts per requirements
      if (actionType === 'like') {
        addToast("Daily Like limit reached. Upgrade to Premium for unlimited Likes.", "error");
        // Optional: Show upgrade modal logic here
      }
      if (actionType === 'superlike') {
        addToast("You’ve used today’s Super Like. Upgrade to send more.", "warning");
      }
      if (actionType === 'restore') {
        if (USER_PLAN === 'free' && limit === 0) addToast("Restore is a Premium feature.", "error");
        else addToast("You’ve used today’s Restore.", "error");
      }
      if (actionType === 'favorite') {
        if (USER_PLAN === 'free') addToast("Favorites limit reached for today.", "error");
        else addToast("Favorites available in Premium.", "error");
      }

      return false;
    }
    return true;
  };

  const incrementUsage = (actionType) => {
    if (['like', 'superlike', 'restore', 'favorite'].includes(actionType)) {
      setDailyUsage(prev => ({ ...prev, [actionType]: (prev[actionType] || 0) + 1 }));
    }
  };

  // ─── ACTION HANDLERS ───────────────────────────────────────────

  const swiped = async (direction, userId, index) => {
    const swipedUser = users[index];

    if (direction === "right") {
      // Like
      incrementUsage('like');
      setCurrentAction('like');
      try {
        const res = await API.post("/users/like", { userId });
        if (res.data.matched) addToast("It's a Match! ❤️", "success");
      } catch (err) { 
        console.error("Like error", err);
        addToast(err.response?.data?.msg || "Failed to like", "error");
      }

    } else if (direction === "left") {
      // Dislike
      setCurrentAction('dislike');
      
    } else if (direction === "up") {
      // Super Like
      incrementUsage('superlike');
      setCurrentAction('superlike');
      try {
        await API.post("/users/like", { userId, type: "superlike" });
        addToast("Super Liked! 💎", "success");
      } catch (err) { 
        console.error("Superlike error", err);
        addToast(err.response?.data?.msg || "Failed to Super Like", "error");
      }
    }

    // Add to history for Restore
    setHistory(prev => [...prev, swipedUser]);

    // Remove Card
    setTimeout(() => {
      setUsers(prev => prev.filter(u => u._id !== userId));
    }, 200); // Fast removal

    // Clear Action Animation (Slow - allows animation to finish)
    setTimeout(() => {
      setCurrentAction(null);
    }, 1500);
  };

  // Manual Button / Gesture Trigger
  const handleButtonAction = async (action) => {
    // 1. RESTORE LOGIC (Special Case)
    if (action === "restore") {
      if (!checkLimit('restore')) return;
      
      if (history.length === 0) {
        addToast("Nothing to restore", "info");
        return;
      }

      const userToRestore = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setUsers(prev => [...prev, userToRestore]); // Add back to end of array
      incrementUsage('restore');
      
      // Visual feedback
      setCurrentAction('restore');
      setTimeout(() => setCurrentAction(null), 1000);
      return;
    }

    const currentUser = users[users.length - 1];
    if (!currentUser) return;

    // 2. CHECK LIMITS
    if (!checkLimit(action)) return;

    // 3. FAVORITE (No Card Swipe)
    if (action === "favorite") {
      try {
        const res = await API.post("/users/favorites", { userId: currentUser._id });
        incrementUsage('favorite');
        addToast(res.data.msg || "Added to Favorites ⭐️", "success");
        // Visual only
        setCurrentAction('favorite');
        setTimeout(() => setCurrentAction(null), 1000);
      } catch (err) { 
        // Fallback: Save to LocalStorage if backend route is missing (404) or network error
        if (err.response?.status === 404 || !err.response) {
          const existingFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
          if (!existingFavs.some(u => u._id === currentUser._id)) {
             const userToSave = { 
               ...currentUser, 
               age: calculateAge(currentUser.date_of_birth) 
             };
             localStorage.setItem('favorites', JSON.stringify([...existingFavs, userToSave]));
          }
          incrementUsage('favorite');
          addToast("Added to Favorites (Local) ⭐️", "success");
          setCurrentAction('favorite');
          setTimeout(() => setCurrentAction(null), 1000);
        } else {
          console.error(err);
          addToast(err.response?.data?.msg || "Failed to add to favorites", "error");
        }
      }
      return;
    }

    // 4. SUPER LIKE (Swipe Up)
    if (action === "superlike") {
      const cardIndex = users.length - 1;
      const cardRef = childRefs[cardIndex];
      if (cardRef && cardRef.current) {
        cardRef.current.swipe('up');
      }
      return;
    }

    // 5. LIKE / DISLIKE (Desktop Buttons)
    const cardIndex = users.length - 1;
    const cardRef = childRefs[cardIndex];
    if (cardRef && cardRef.current) {
      if (action === 'like') cardRef.current.swipe('right');
      if (action === 'dislike') cardRef.current.swipe('left');
    }
  };

  // ─── MOBILE GESTURE LOGIC ───────────────────────────────────────────

  // ─── DESKTOP MOUSE LOGIC ───────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (isMobile) return;
    touchStartTime.current = Date.now();
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    if (isMobile) return;
    const deltaY = e.clientY - touchStartY.current;
    const deltaX = e.clientX - touchStartX.current;

    // Swipe Up Check (Open Profile)
    if (deltaY < -80 && Math.abs(deltaX) < 60) {
       const currentUser = users[users.length - 1];
       if (currentUser) {
           setSelectedUser(currentUser);
       }
    }
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    dragRef.current = { startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX };

    // Check for Two-Finger Swipe (Restore)
    if (e.touches.length === 2) {
      dragRef.current.isTwoFinger = true;
    } else {
      dragRef.current.isTwoFinger = false;
    }

    touchStartTime.current = Date.now();
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;

    // 1. Animate Overlays
    if (overlayLikeRef.current && overlayNopeRef.current) {
      // Right Drag -> Like (Green opacity)
      if (deltaX > 0) {
        const opacity = Math.min(deltaX / 150, 1); 
        overlayLikeRef.current.style.opacity = opacity;
        overlayNopeRef.current.style.opacity = 0;
        overlayLikeRef.current.style.transform = `rotate(15deg) scale(${1 + opacity * 0.2})`;
      }
      // Left Drag -> Nope (Red opacity)
      else {
        const opacity = Math.min(Math.abs(deltaX) / 150, 1);
        overlayNopeRef.current.style.opacity = opacity;
        overlayLikeRef.current.style.opacity = 0;
        overlayNopeRef.current.style.transform = `rotate(-15deg) scale(${1 + opacity * 0.2})`;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!isMobile) return;

    // Reset Overlays
    if (overlayLikeRef.current) overlayLikeRef.current.style.opacity = 0;
    if (overlayNopeRef.current) overlayNopeRef.current.style.opacity = 0;

    const touch = e.changedTouches[0];
    const duration = Date.now() - touchStartTime.current;
    const moveX = touch.clientX - touchStartX.current;
    const moveY = touch.clientY - touchStartY.current;
    const absMoveX = Math.abs(moveX);
    const absMoveY = Math.abs(moveY);

    // 1. Two-Finger Swipe Down Check (Restore)
    if (dragRef.current.isTwoFinger) {
      const deltaY = touch.clientY - dragRef.current.startY;
      if (deltaY > 50) { // Swiped Down
        handleButtonAction('restore');
        return;
      }
    }

    // 2. Swipe Up Check (Open Profile) - Mobile
    if (!dragRef.current.isTwoFinger) {
      const deltaY = touch.clientY - touchStartY.current;
      const deltaX = touch.clientX - touchStartX.current;
      if (deltaY < -80 && Math.abs(deltaX) < 60) {
         const currentUser = users[users.length - 1];
         if (currentUser) {
             setSelectedUser(currentUser);
             return;
         }
      }
    }

    // 3. Tap Check (Short duration, little movement)
    if (duration < 300 && absMoveX < 10 && absMoveY < 10) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
        // DOUBLE TAP -> Super Like
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        handleButtonAction('superlike');
        setLastTap(0);
      } else {
        // SINGLE TAP -> Favorite
        setLastTap(now);
        clickTimeoutRef.current = setTimeout(() => {
          handleButtonAction('favorite');
          setLastTap(0);
        }, DOUBLE_TAP_DELAY);
      }
      return;
    }

    // 4. Check for Blocked Swipes (Limits)
    // If user dragged far enough to swipe, but it was prevented/snapped back by TinderCard
    if (absMoveX > 100) { 
      if (moveX > 0) { // Right (Like)
        if (dailyUsage.like >= ACTION_LIMITS[USER_PLAN].like) {
          checkLimit('like'); // Trigger toast/shake
        }
      }
    }
  };

  const handleInfoClick = (user, e) => {
    e.stopPropagation();
    setSelectedUser(user);
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div
      className="h-full w-full relative overflow-hidden bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* 🔥 Daily Streak Badge */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-orange-100 flex items-center gap-1.5 animate-fade-in-down">
            <span className="text-lg">🔥</span>
            <span className="text-xs font-extrabold text-orange-600 tracking-wide">{streak} Day Streak</span>
        </div>
      </div>

      {/* Card Stack */}
      {!selectedUser && (
        <div className="flex flex-col justify-center items-center h-full pt-4">
          {users.length === 0 && (
            <div className="text-center text-gray-400 p-10">
              <p className="text-xl">No more profiles.</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          )}

          {/* Animation Overlay - Matches Card Dimensions */}
          {currentAction && (
            <div className="absolute w-[90vw] max-w-sm h-[70vh] z-[200] pointer-events-none">
                {/* Restore Label */}
                {currentAction === 'restore' && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white px-4 py-2 rounded-full shadow-lg animate-bounce z-50">
                        <span className="font-bold">Restored 🔄</span>
                    </div>
                )}
                
                {/* Floating Icons for other actions */}
                {currentAction !== 'restore' && [...Array(10)].map((_, i) => {
                const size = 24; 
                const delay = i * 0.1;
                let baseLeft = 50;
                if (currentAction === 'like') baseLeft = 80;
                else if (currentAction === 'dislike') baseLeft = 20;
                
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
                        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="2" className="drop-shadow-xl">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                      )}
                      {currentAction === 'superlike' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#3b82f6" className="drop-shadow-xl">
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
            {users.map((user, index) => {
              // Only render the top few cards for performance
              if (index < users.length - 3) return null;
              
              const isTopCard = index === users.length - 1;
              const reverseIndex = users.length - 1 - index; // 0 for top card

              return (
                <div
                  key={user._id}
                  className={`absolute inset-0 ${isTopCard && removingCard ? 'animate-slide-out-left' : ''} ${isTopCard && shake ? 'animate-shake' : ''}`}
                  style={{
                    zIndex: index,
                    transform: `scale(${1 - reverseIndex * 0.05}) translateY(${-reverseIndex * 10}px)`,
                    opacity: 1,
                    pointerEvents: isTopCard ? 'auto' : 'none',
                  }}
                >
                  <TinderCard
                    ref={childRefs[index]}
                    className="swipe"
                    onSwipe={(dir) => swiped(dir, user._id, index)}
                    preventSwipe={
                      !isMobile
                        ? ["left", "right", "up", "down"]
                        : [
                            "down",
                            "up", // Block native swipe up (Super Like is double tap)
                            dailyUsage.like >= ACTION_LIMITS[USER_PLAN].like ? "right" : ""
                          ].filter(Boolean)
                    }
                  >
                    <div
                      className="relative w-[90vw] max-w-sm h-[70vh] bg-white shadow-2xl rounded-3xl cursor-pointer"
                    >

                      {/* 📱 MOBILE OVERLAYS (Like/Nope) */}
                      {isTopCard && (
                        <>
                          {/* ❌ NOPE (Bottom-Left) */}
                          <div ref={overlayNopeRef} className="absolute bottom-8 left-8 w-[90px] h-[90px] rounded-full border-[6px] border-red-500 bg-red-500/20 flex items-center justify-center transform -rotate-15 z-50 pointer-events-none opacity-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                             </svg>
                          </div>

                          {/* ❤️ LIKE (Bottom-Right) */}
                          <div ref={overlayLikeRef} className="absolute bottom-8 right-8 w-[90px] h-[90px] rounded-full border-[6px] border-pink-500 bg-pink-500/20 flex items-center justify-center transform rotate-15 z-50 pointer-events-none opacity-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                             </svg>
                          </div>

                          {/* 💎 SUPER LIKE (Center) */}
                          {currentAction === 'superlike' && (
                            <div className="absolute inset-0 flex items-center justify-center z-50 animate-ping">
                              <span className="text-blue-600 text-6xl drop-shadow-lg">💎</span>
                            </div>
                          )}
                          
                          {/* ⭐ FAV (Top-Right) */}
                          {currentAction === 'favorite' && (
                            <div className="absolute top-5 right-5 z-50 animate-bounce">
                              <span className="text-yellow-400 text-5xl drop-shadow-md filter brightness-110">⭐️</span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="w-full h-full overflow-hidden rounded-3xl relative">

                        {/* Image Area */}
                        <div
                          className="h-3/4 w-full bg-cover bg-center touch-manipulation pressable"
                          style={{ backgroundImage: `url(${user.photos?.[0]?.url || 'https://via.placeholder.com/400'})` }}
                          // Attach Touch Listeners HERE for Drag Tracking
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onMouseDown={handleMouseDown}
                          onMouseUp={handleMouseUp}
                        >
                          <div className="absolute inset-0  opacity-50 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                        </div>

                        {/* Info Area */}
                        <div
                          className="absolute bottom-0 w-full p-5 text-white bg-black/30 backdrop-blur-md border-t border-white/20"
                          onClick={(e) => handleInfoClick(user, e)}
                        >
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

          {/* Action Buttons (Desktop Only) */}
          {!isMobile && users.length > 0 && (
            <div className="flex justify-center gap-4 md:gap-6 mt-4 md:mt-8 z-[100] pointer-events-auto pb-4 md:pb-8 w-full px-4 items-center">

              {/* 1. Restore (Rewind) */}
              <button
                onClick={() => handleButtonAction('restore')}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-500 hover:scale-110 active:scale-95 transition-transform border border-yellow-100"
                title="Rewind"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              </button>

              {/* 2. Dislike (Nope) */}
              <button
                onClick={() => handleButtonAction('dislike')}
                className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform border-2 border-red-100"
                title="Dislike"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* 3. Favorite (Fav) - Gold Star */}
              <button
                onClick={() => handleButtonAction('favorite')}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-500 hover:scale-110 active:scale-95 transition-transform border border-yellow-100"
                title="Add to Favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </button>

              {/* 4. Like (Right) */}
              <button
                onClick={() => handleButtonAction('like')}
                className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
                title="Like"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* 5. Super Like (Star) - Blue Star */}
              <button
                onClick={() => handleButtonAction('superlike')}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-transform border border-blue-100"
                title="Super Like"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>

            </div>
          )}
        </div>
      )}

      {/* 🎁 Daily Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-bounce-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                <div className="text-6xl mb-4 animate-bounce">🎁</div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Daily Reward!</h2>
                <p className="text-gray-600 mb-6 text-sm">You've unlocked a free boost for keeping your streak alive.</p>
                
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 flex items-center justify-center gap-3">
                    <span className="text-2xl">💎</span>
                    <p className="font-bold text-orange-700 text-lg">+1 Super Like</p>
                </div>

                <button 
                    onClick={handleClaimReward}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
                >
                    Claim Reward
                </button>
            </div>
        </div>
      )}

      {/* Full Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 top-16 z-50 bg-white overflow-y-auto animate-slide-up border-t border-gray-200">
          <button
            onClick={() => setSelectedUser(null)}
            className="fixed top-20 right-4 z-[60] bg-black/40 p-2 rounded-full text-white hover:bg-black/60 backdrop-blur-sm"
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
