import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AccountSettings() {
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);
    const [toast, setToast] = useState(null);

    // Change password state
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    // Change phone state
    const [newPhone, setNewPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpHint, setOtpHint] = useState("");

    // Delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            const res = await API.get("/account/me");
            setAccount(res.data);
        } catch {
            showToast("Failed to load account info", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ───── Change Password ─────
    const handleChangePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword) {
            return showToast("Please fill in all fields", "error");
        }
        if (passwords.newPassword.length < 6) {
            return showToast("Password must be at least 6 characters", "error");
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showToast("Passwords don't match", "error");
        }
        try {
            await API.put("/account/password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            showToast("Password changed successfully! ✓");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setActiveSection(null);
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to change password", "error");
        }
    };

    // ───── Change Phone ─────
    const handleChangePhone = async () => {
        if (!newPhone) return showToast("Enter a phone number", "error");
        try {
            await API.put("/account/phone", { newPhone });
            showToast("Phone updated. Verify with OTP.");
            await fetchAccount();
            setNewPhone("");
            setActiveSection("verifyPhone");
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to update phone", "error");
        }
    };

    const handleSendOTP = async () => {
        try {
            const res = await API.post("/account/send-otp");
            setOtpSent(true);
            setOtpHint(res.data.hint || "");
            showToast("OTP sent to your phone!");
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to send OTP", "error");
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode) return showToast("Enter the OTP code", "error");
        try {
            await API.post("/account/verify-otp", { code: otpCode });
            showToast("Phone verified successfully! ✓");
            setOtpSent(false);
            setOtpCode("");
            setOtpHint("");
            setActiveSection(null);
            await fetchAccount();
        } catch (err) {
            showToast(err.response?.data?.msg || "Invalid OTP", "error");
        }
    };

    // ───── Notifications ─────
    const handleToggleNotifications = async () => {
        try {
            const newVal = !account.notificationsEnabled;
            await API.put("/account/notifications", { enabled: newVal });
            setAccount({ ...account, notificationsEnabled: newVal });
            showToast(`Notifications ${newVal ? "enabled" : "disabled"}`);
        } catch (err) {
            showToast("Failed to update notifications", "error");
        }
    };

    // ───── Logout ─────
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // ───── Delete Account ─────
    const handleDelete = async () => {
        try {
            await API.delete("/users");
            localStorage.removeItem("token");
            navigate("/");
        } catch {
            showToast("Failed to delete account", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl font-semibold text-sm transition-all duration-300 animate-slideDown ${toast.type === "error"
                        ? "bg-red-500 text-white"
                        : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                        }`}
                    style={{ animation: "slideDown 0.3s ease-out" }}
                >
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="flex items-center justify-between px-5 py-4">
                    <button onClick={() => navigate("/profile")} className="text-gray-500 hover:text-gray-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Account Settings</h1>
                    <div className="w-6"></div>
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-lg mx-auto">

                {/* ─── Account Info Card ─── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
                                {account?.first_name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">{account?.first_name || "User"}</h2>
                                <p className="text-white/80 text-sm flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 bg-green-300 rounded-full"></span>
                                    Signed in via {account?.authProvider || "email"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm font-medium">Email</span>
                            <span className="text-gray-800 font-semibold text-sm">{account?.maskedEmail || "Not set"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 text-sm font-medium">Phone</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-800 font-semibold text-sm">{account?.maskedPhone || "Not set"}</span>
                                {account?.phoneNumber && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${account?.phoneVerified
                                        ? "bg-green-100 text-green-600"
                                        : "bg-amber-100 text-amber-600"
                                        }`}>
                                        {account?.phoneVerified ? "Verified" : "Unverified"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Change Password ─── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => setActiveSection(activeSection === "password" ? null : "password")}
                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Change Password</p>
                                <p className="text-xs text-gray-400">Update your login password</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${activeSection === "password" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {activeSection === "password" && (
                        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4" style={{ animation: "slideDown 0.3s ease-out" }}>
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                            />
                            <input
                                type="password"
                                placeholder="New Password (min 6 chars)"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                            />
                            <button
                                onClick={handleChangePassword}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                Update Password
                            </button>
                        </div>
                    )}
                </div>

                {/* ─── Change Phone Number ─── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => setActiveSection(activeSection === "phone" ? null : "phone")}
                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Phone Number</p>
                                <p className="text-xs text-gray-400">Change or verify your phone</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${activeSection === "phone" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {activeSection === "phone" && (
                        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4" style={{ animation: "slideDown 0.3s ease-out" }}>
                            <input
                                type="tel"
                                placeholder="New phone number (e.g. +1234567890)"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition"
                            />
                            <button
                                onClick={handleChangePhone}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                Update Phone Number
                            </button>
                        </div>
                    )}

                    {activeSection === "verifyPhone" && (
                        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4" style={{ animation: "slideDown 0.3s ease-out" }}>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-amber-700 text-sm font-medium">
                                    📱 Phone updated! Send an OTP to verify it.
                                </p>
                            </div>

                            {!otpSent ? (
                                <button
                                    onClick={handleSendOTP}
                                    className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                >
                                    Send OTP
                                </button>
                            ) : (
                                <>
                                    {otpHint && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                            <p className="text-blue-600 text-xs font-medium">🔑 Dev Mode: {otpHint}</p>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-center text-2xl tracking-[0.5em] font-bold text-gray-800 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
                                    />
                                    <button
                                        onClick={handleVerifyOTP}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                    >
                                        Verify OTP
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Visibility (Show me on FaithDate) ─── */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Show me on FaithDate</p>
                                <p className="text-xs text-gray-400">Turn off to hide your profile</p>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={async () => {
                                try {
                                    const newVal = !account.isVisible;
                                    await API.put("/users/profile", { isVisible: newVal });
                                    setAccount({ ...account, isVisible: newVal });
                                    showToast(newVal ? "You are now visible" : "Your profile is hidden");
                                } catch (err) {
                                    showToast("Failed to update visibility", "error");
                                }
                            }}
                            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${account?.isVisible
                                ? "bg-gradient-to-r from-pink-500 to-rose-500"
                                : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${account?.isVisible ? "left-7" : "left-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* ─── Notifications Toggle ─── */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Notifications</p>
                                <p className="text-xs text-gray-400">Push notifications & alerts</p>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={handleToggleNotifications}
                            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${account?.notificationsEnabled
                                ? "bg-gradient-to-r from-rose-500 to-pink-500"
                                : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${account?.notificationsEnabled ? "left-7" : "left-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* ─── App Info ─── */}
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About</h3>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 text-sm">App Version</span>
                        <span className="text-gray-400 text-sm font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 text-sm">Terms of Service</span>
                        <span className="text-gray-400 text-sm">›</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 text-sm">Privacy Policy</span>
                        <span className="text-gray-400 text-sm">›</span>
                    </div>
                </div>

                {/* ─── Danger Zone ─── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-2">
                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Danger Zone</h3>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition border-b border-gray-50"
                    >
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-800">Logout</p>
                            <p className="text-xs text-gray-400">Sign out of your account</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition"
                    >
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-red-600">Delete Account</p>
                            <p className="text-xs text-gray-400">Permanently remove your account & data</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ animation: "fadeIn 0.2s ease-out" }}>
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" style={{ animation: "slideUp 0.3s ease-out" }}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Account?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                This action is <strong>permanent</strong>. All your matches, messages, and profile data will be erased forever.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleDelete}
                                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                Yes, Delete My Account
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
