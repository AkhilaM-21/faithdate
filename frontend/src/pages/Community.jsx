import { useEffect, useState } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Community() {
  const { addToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [type, setType] = useState("Discussion");
  const [image, setImage] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    API.get("/community")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Failed to fetch posts", err));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !image) return;
    try {
      const res = await API.post("/community", { content, type, image });
      setPosts([res.data, ...posts]);
      setContent("");
      setImage(null);
    } catch (err) {
      console.error("Failed to create post", err);
      addToast("Failed to create post. Please try again.", "error");
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await API.put(`/community/like/${id}`);
      setPosts(posts.map(p => p._id === id ? { ...p, likes: res.data } : p));
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await API.post(`/community/comment/${postId}`, { text: commentText });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: res.data } : p));
      setCommentText("");
    } catch (err) {
      console.error("Failed to submit comment", err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
    setCommentText("");
  };

  const handleReport = async (postId) => {
    const reason = window.prompt("Please provide a reason for reporting this post:");
    if (reason) {
      try {
        await API.post(`/community/report/${postId}`, { reason });
        addToast("Thank you. This post has been reported for review.", "success");
      } catch (error) {
        addToast("Failed to report post.", "error");
      }
    }
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-pink-600 mb-6">Community</h1>

      {/* Create Post */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a prayer request, thought, or event..."
          className="w-full p-3 border-none bg-gray-50 rounded-xl focus:ring-0 resize-none"
          rows="3"
        />

        {image && (
          <div className="mb-3 relative mt-2">
            <img src={image} alt="Preview" className="w-full h-auto rounded-lg" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-sm border-none bg-transparent font-medium text-gray-600 focus:ring-0"
            >
              <option value="Discussion">Discussion</option>
              <option value="Prayer">Prayer Request</option>
              <option value="Event">Event</option>
            </select>
            <label className="cursor-pointer text-gray-500 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
          </div>
          <button
            onClick={handlePost}
            className="bg-pink-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-pink-700"
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post._id} className="bg-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center mb-3">
              <img
                src={post.author?.photos?.[0]?.url || "https://via.placeholder.com/40"}
                alt="Author"
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <h3 className="font-bold text-gray-800">{post.author?.first_name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${post.type === 'Prayer' ? 'bg-blue-100 text-blue-600' :
                    post.type === 'Event' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {post.type}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>

            {post.image && (
              <img src={post.image} alt="Post content" className="w-full h-auto rounded-xl mb-4" />
            )}

            <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
              <button onClick={() => handleLike(post._id)} className="text-pink-500 font-medium text-sm flex items-center gap-1 hover:bg-pink-50 px-2 py-1 rounded-lg transition">
                <span>❤️</span> {post.likes.length}
              </button>
              <button onClick={() => toggleComments(post._id)} className="text-gray-500 font-medium text-sm flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg transition">
                <span>💬</span> {post.comments?.length || 0}
              </button>
              <button onClick={() => handleReport(post._id)} className="text-gray-400 font-medium text-sm flex items-center gap-1 hover:bg-red-50 hover:text-red-500 px-2 py-1 rounded-lg transition ml-auto">
                <span>🚩</span> Report
              </button>
            </div>

            {/* Comments Section */}
            {expandedPostId === post._id && (
              <div className="mt-4 pt-3 border-t border-gray-50 animate-fade-in">
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {post.comments?.map((comment, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <img
                        src={comment.author?.photos?.[0]?.url || "https://via.placeholder.com/30"}
                        alt="User"
                        className="w-6 h-6 rounded-full object-cover mt-1"
                      />
                      <div className="bg-gray-50 p-2 rounded-lg rounded-tl-none flex-1">
                        <p className="text-xs font-bold text-gray-700">{comment.author?.first_name}</p>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-300"
                  />
                  <button onClick={() => handleCommentSubmit(post._id)} className="text-pink-600 font-bold text-sm px-2">Post</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}