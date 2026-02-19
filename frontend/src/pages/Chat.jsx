import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import io from "socket.io-client";
import { useToast } from "../context/ToastContext";

// Mock GIF List (in a real app, use Tenor/Giphy API)
const MOOD_GIFS = [
  "https://media.tenor.com/nZtqkK18W24AAAAM/hello-hi.gif",
  "https://media.tenor.com/pC0afEjaPHEAAAAM/cat-cute.gif",
  "https://media.tenor.com/1-1Va9TQZtQAAAAM/excited-dog.gif",
  "https://media.tenor.com/UD_r1_dI0xEAAAAM/dating-flirt.gif",
  "https://media.tenor.com/k912_2F4Gj4AAAAM/love-heart.gif",
  "https://media.tenor.com/l5_u4J0x13kAAAAM/funny-laugh.gif"
];

const socket = io("http://localhost:5000");

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [matchUser, setMatchUser] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Other user typing status
  const [showMenu, setShowMenu] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Current User & Match Messages
    const initChat = async () => {
      setMessages([]); // Clear previous messages
      try {
        const userRes = await API.get("/users/me");
        setCurrentUser(userRes.data);

        // Fetch Messages
        const msgRes = await API.get(`/messages/${matchId}`);
        setMessages(msgRes.data);

        // Fetch Match Details (User Info)
        const matchRes = await API.get("/users/matches");
        const currentMatch = matchRes.data.find(m => m._id === matchId);
        if (currentMatch) {
          setMatchUser(currentMatch.user);
        } else {
          // If not in matches list, maybe unmatched or error
          // navigate("/matches"); // Optional: redirect if invalid
        }
      } catch (err) {
        console.error("Chat init error", err);
      }
    };

    initChat();

    // 2. Socket Setup
    socket.emit("joinRoom", matchId);

    socket.on("receiveMessage", (data) => {
      setMessages(prev => [...prev, data]);
      setIsTyping(false);
      // Mark as read immediately if open (simple logic)
      socket.emit("messagesRead", { matchId });
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    socket.on("messagesRead", () => {
      // Update local messages to read (optimistic or re-fetch)
      setMessages(prev => prev.map(m => ({ ...m, readBy: [...(m.readBy || []), "match"] })));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messagesRead");
      socket.emit("stopTyping", { matchId });
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read when messages change (if I am recipient)
    if (messages.length > 0) {
      // In a real app, call API to mark read
      // API.post("/messages/read", { matchId });
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { matchId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stopTyping", { matchId });
    }, 2000);
  };

  const sendMessage = async (type = "text", content = null) => {
    if (type === "text" && !text.trim()) return;

    const messagePayload = {
      matchId,
      text: type === "text" ? text : "",
      type,
      mediaUrl: content,
      sender: currentUser._id,
      createdAt: new Date().toISOString()
    };

    // Optimistic Update
    setMessages(prev => [...prev, messagePayload]); // Note: backend adds ID, flagged, etc.

    // Reset Input
    if (type === "text") setText("");
    setShowGifs(false);
    socket.emit("stopTyping", { matchId });

    try {
      await API.post("/messages", messagePayload);
      // Socket emit is handled by backend to avoid duplicates? 
      // Actually backend emits receiveMessage. frontend listens.
      // So optimistic update might duplicate if we don't handle ID.
      // For now, simple list append works if we ignore duplicate updates or re-fetch.
    } catch (err) {
      console.error("Send failed", err);
      // Remove optimistic message if failed?
    }
  };

  const checkSafety = (msg) => {
    if (msg.isFlagged) return true;
    // Client-side regex for immediate feedback (optional)
    const phoneRegex = /\b\d{10,}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    return phoneRegex.test(msg.text);
  };

  const handleImageUpload = (e) => {
    if (!currentUser.isPremium) {
      addToast("🔒 Premium Feature: Upgrade to send photos!", "error");
      return;
    }

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnmatch = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      await API.post(`/users/matches/${matchId}/unmatch`);
      navigate("/matches");
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Reason for reporting:");
    if (reason) {
      await API.post("/users/report", { reportedUserId: matchUser._id, reason });
      addToast("User reported.", "success");
      handleUnmatch();
    }
  };

  if (!currentUser) return <div className="p-4 text-center">Loading chat...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/matches")} className="p-2 -ml-2 text-gray-400 hover:text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          {matchUser && (
            <div className="flex items-center gap-3" onClick={() => navigate(`/profile-view/${matchUser._id}`)}> {/* Placeholder for profile view */}
              <div className="relative">
                <img src={matchUser.photos?.[0]?.url || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Match" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{matchUser.first_name}</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  Active now
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Menu (Unmatch/Report) */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-fade-in z-50">
              <button onClick={handleUnmatch} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-medium">Unmatch</button>
              <button onClick={handleReport} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Report User</button>
            </div>
          )}
          {/* Backdrop to close menu */}
          {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scroll-smooth">

        {/* Timestamp Separator (Mock) */}
        <div className="text-center text-xs text-gray-400 my-4">Today</div>

        {messages.map((m, i) => {
          const isMe = m.sender === currentUser._id;
          const isFlagged = checkSafety(m);

          return (
            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isMe
                  ? "bg-pink-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                  }`}
              >
                {/* Image */}
                {m.type === "image" && (
                  <img src={m.mediaUrl} alt="Sent" className="rounded-lg mb-1 max-w-full h-auto object-cover max-h-60" />
                )}

                {/* GIF */}
                {m.type === "gif" && (
                  <img src={m.mediaUrl} alt="GIF" className="rounded-lg mb-1 max-w-full h-auto object-cover" />
                )}

                {/* Text */}
                {m.type === "text" && <p className="text-sm">{m.text}</p>}

                {/* Metadata / Safety */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  {isFlagged && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded flex items-center gap-1" title="Potentially unsafe content detected">
                      ⚠️ Unsafe?
                    </span>
                  )}
                  <span className={`text-[10px] ${isMe ? "text-pink-100" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && ( // Read Receipts
                    <span className="text-[10px] ml-1">
                      {m.readBy?.length > 1 ? "✓✓" : "✓"} {/* Simple mock for read status */}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-xs ml-2 animate-pulse">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT AREA ── */}
      <div className="fixed bottom-0 w-full bg-white px-3 py-3 border-t border-gray-100 flex items-center gap-2 pb-safe z-50">

        {/* GIF Picker Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowGifs(!showGifs)}
            className={`p-2 rounded-full transition-colors ${showGifs ? "text-pink-500 bg-pink-50" : "text-gray-400 hover:text-pink-500"}`}
          >
            <span className="font-bold text-xs border border-current rounded px-1">GIF</span>
          </button>

          {/* GIF Picker Modal */}
          {showGifs && (
            <div className="absolute bottom-14 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 grid grid-cols-2 gap-2 animate-slide-up z-50 h-60 overflow-y-auto">
              {MOOD_GIFS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                  onClick={() => sendMessage("gif", url)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <label className={`p-2 transition-colors cursor-pointer ${!currentUser?.isPremium ? "text-gray-300 hover:text-gray-400" : "text-gray-400 hover:text-pink-500"}`} onClick={(e) => !currentUser?.isPremium && e.preventDefault() || !currentUser?.isPremium && addToast("🔒 Upgrade to Premium to send photos!", "error")}>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!currentUser?.isPremium} />
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            {!currentUser?.isPremium && (
              <div className="absolute -top-1 -right-1 bg-gray-100 rounded-full p-0.5 border border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
            )}
          </div>
        </label>

        {/* Text Input */}
        <input
          value={text}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage("text")}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
        />

        {/* Send Button */}
        <button
          onClick={() => sendMessage("text")}
          className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 hover:scale-105 transition disabled:opacity-50 disabled:scale-100"
          disabled={!text.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>

      {/* Backdrop for GIF picker close */}
      {showGifs && <div className="fixed inset-0 z-40" onClick={() => setShowGifs(false)}></div>}

    </div>
  );
}
