import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat() {

  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch current user to determine sent/received alignment
    API.get("/users/me").then(res => setCurrentUser(res.data));

    socket.emit("joinRoom", matchId);

    API.get(`/messages/${matchId}`)
      .then(res => {
        setMessages(res.data);
        scrollToBottom();
      });

    socket.on("receiveMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.disconnect();

  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const message = {
      matchId,
      text,
      sender: currentUser._id, // Optimistic update helper
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages(prev => [...prev, message]);
    socket.emit("sendMessage", message);
    setText("");

    await API.post("/messages", message);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 pt-20">
        {messages.map((m, i) => {
          const isMe = m.sender === currentUser?._id;
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  isMe 
                    ? "bg-pink-500 text-white rounded-br-none" 
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-pink-100" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-white p-3 border-t border-gray-100 flex items-center gap-2 pb-safe z-50">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        />
        <button 
          onClick={sendMessage} 
          className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition disabled:opacity-50"
          disabled={!text.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
}
