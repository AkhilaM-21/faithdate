import React, { useState, useEffect } from 'react';

const Toast = ({ toast, removeToast }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe threshold
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            removeToast(toast.id);
        }, 300); // 300ms matches animation duration
    };

    return (
        <div
            className={`
        flex items-center justify-between p-4 mb-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 transform border-2 border-pink-500
        ${isExiting ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}
        bg-white/30 text-gray-800
      `}
            style={{ minWidth: '300px', maxWidth: '90vw' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="flex items-center gap-3">
                {toast.type === 'success' && <span>✅</span>}
                {toast.type === 'error' && <span>❌</span>}
                {toast.type === 'info' && <span>ℹ️</span>}
                {toast.type === 'warning' && <span>⚠️</span>}
                <p className="font-medium text-sm">{toast.message}</p>
            </div>

            <button
                onClick={handleClose}
                className="ml-4 p-1 rounded-full hover:bg-pink-500/20 text-pink-600 transition-colors"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col items-center pointer-events-auto">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
