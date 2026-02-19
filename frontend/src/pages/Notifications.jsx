import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, unread, like, match, message

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await API.put("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            const deleted = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await API.delete("/notifications/clear");
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to clear notifications:", err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) handleMarkAsRead(notification._id);

        // Navigate based on notification type
        switch (notification.type) {
            case "match":
                if (notification.data?.matchId) navigate(`/chat/${notification.data.matchId}`);
                else navigate("/matches");
                break;
            case "message":
                if (notification.data?.matchId) navigate(`/chat/${notification.data.matchId}`);
                else navigate("/messages");
                break;
            case "like":
                navigate("/discover");
                break;
            default:
                break;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return (
                    <div className="w-11 h-11 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case "match":
                return (
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                );
            case "message":
                return (
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                );
        }
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.isRead;
        if (filter === "all") return true;
        return n.type === filter;
    });

    // Group by today / this week / earlier
    const groupNotifications = (notifs) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups = { today: [], thisWeek: [], earlier: [] };
        notifs.forEach(n => {
            const date = new Date(n.createdAt);
            if (date >= today) groups.today.push(n);
            else if (date >= weekAgo) groups.thisWeek.push(n);
            else groups.earlier.push(n);
        });
        return groups;
    };

    const grouped = groupNotifications(filteredNotifications);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-16 z-30">
                <div className="flex items-center justify-between px-5 py-3">
                    <h1 className="text-xl font-bold text-gray-800">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-bold text-pink-500 hover:text-pink-700 transition px-2 py-1"
                            >
                                Read all
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 transition px-2 py-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
                    {[
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "like", label: "❤️ Likes" },
                        { key: "match", label: "⭐ Matches" },
                        { key: "message", label: "💬 Messages" }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === key
                                    ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-400">No notifications yet</h3>
                        <p className="text-sm text-gray-400 mt-1">When you get likes, matches or messages,<br />they'll show up here.</p>
                    </div>
                ) : (
                    <>
                        {/* Today */}
                        {grouped.today.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Today</h3>
                                <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                                    {grouped.today.map(n => renderNotification(n))}
                                </div>
                            </div>
                        )}

                        {/* This Week */}
                        {grouped.thisWeek.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">This Week</h3>
                                <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                                    {grouped.thisWeek.map(n => renderNotification(n))}
                                </div>
                            </div>
                        )}

                        {/* Earlier */}
                        {grouped.earlier.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Earlier</h3>
                                <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                                    {grouped.earlier.map(n => renderNotification(n))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .notif-item { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
        </div>
    );

    function renderNotification(n) {
        return (
            <div
                key={n._id}
                className={`notif-item flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 ${!n.isRead ? "bg-pink-50/50" : ""
                    }`}
                onClick={() => handleNotificationClick(n)}
            >
                {/* Icon or Avatar */}
                <div className="flex-shrink-0 relative">
                    {n.sender?.photos?.[0]?.url ? (
                        <img
                            src={n.sender.photos[0].url}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                        />
                    ) : (
                        getNotificationIcon(n.type)
                    )}
                    {!n.isRead && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 rounded-full border-2 border-white"></div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                        {n.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Delete button */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                    className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    }
}
