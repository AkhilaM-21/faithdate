import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get("/users/matches");
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchConversations();
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-pink-600 mb-6">Messages</h1>
      
      <div className="space-y-2">
        {conversations.map((convo) => (
          <div
            key={convo._id}
            onClick={() => navigate(`/chat/${convo._id}`)}
            className="flex items-center p-3 bg-white rounded-xl shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            <img
              src={convo.user?.photos?.[0]?.url || "https://via.placeholder.com/150"}
              alt={convo.user?.first_name}
              className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-pink-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-bold text-gray-800 truncate">{convo.user?.first_name}</h3>
                <span className="text-xs text-gray-400">{formatTime(convo.lastMessageTime)}</span>
              </div>
              <p className={`text-sm truncate ${convo.lastMessage ? 'text-gray-600' : 'text-pink-500 font-medium'}`}>
                {convo.lastMessage || "New Match! Say hello 👋"}
              </p>
            </div>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p>No conversations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}