import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    email: "",
    password: "",
    date_of_birth: "",
    phoneNumber: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.first_name || !form.email || !form.password) {
      return setError("Please fill in all required fields");
    }

    if (form.date_of_birth) {
      if (calculateAge(form.date_of_birth) < 18) {
        return setError("You must be at least 18 years old to register");
      }
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      await API.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    }
  };

  const handleSocialLogin = async (provider) => {
    // Stub: simulate social login with random social ID
    try {
      const res = await API.post("/auth/social", {
        provider,
        socialId: `${provider}_${Date.now()}`,
        email: `${provider}_user@demo.com`,
        first_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
      });
      localStorage.setItem("token", res.data.token);
      if (res.data.isProfileComplete) {
        navigate("/discover");
      } else {
        navigate("/setup");
      }
    } catch (err) {
      setError(err.response?.data?.msg || `${provider} login failed`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-rose-400 via-pink-400 to-rose-300 rounded-[40px] shadow-[0_30px_60px_-12px_rgba(50,50,93,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row transform transition-all hover:scale-[1.005] duration-500">

        {/* Internal Floating Clouds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[8%] animate-float-slow opacity-60">
            <svg width="140" height="90" viewBox="0 0 120 80" fill="white" className="drop-shadow-sm"><path d="M40 60C40 71 49 80 60 80H100C111 80 120 71 120 60C120 49 111 40 100 40C98 40 96 40.4 94.2 41C92.4 29 82.2 20 70 20C69 20 68 20 67 20.2C64.2 8.6 53.8 0 41.6 0C27.6 0 15.8 9.6 12.4 22.8C5.4 24.6 0 30.8 0 38.4C0 46.8 6 53.8 14 55.6C14 57 14 58.6 14 60H40Z" /></svg>
          </div>
          <div className="absolute bottom-[20%] right-[55%] animate-float opacity-60" style={{ animationDelay: '3s' }}>
            <svg width="160" height="100" viewBox="0 0 120 80" fill="white" className="drop-shadow-sm"><path d="M40 60C40 71 49 80 60 80H100C111 80 120 71 120 60C120 49 111 40 100 40C98 40 96 40.4 94.2 41C92.4 29 82.2 20 70 20C69 20 68 20 67 20.2C64.2 8.6 53.8 0 41.6 0C27.6 0 15.8 9.6 12.4 22.8C5.4 24.6 0 30.8 0 38.4C0 46.8 6 53.8 14 55.6C14 57 14 58.6 14 60H40Z" /></svg>
          </div>
          <div className="absolute top-[20%] right-[30%] w-40 h-40 bg-rose-300 rounded-full mix-blend-multiply opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-[10%] left-[20%] w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply opacity-30 blur-3xl animate-blob"></div>
        </div>

        {/* Left Side - Illustration */}
        <div className="w-full md:w-1/2 relative p-12 flex flex-col items-center justify-center z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/30 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
          <div className="relative z-10 animate-float">
            <img src="/assets/heartballon.png" alt="Heart Balloon" className="w-full max-w-[280px] h-auto drop-shadow-2xl" />
          </div>
          <div className="relative z-10 mt-8 text-center">
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md tracking-tight">Begin Your Story</h2>
            <p className="mt-3 text-white/90 font-medium text-lg">Create memories that last forever.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 relative z-10 flex flex-col justify-center border-l border-white/20 backdrop-blur-sm bg-white/20">

          <div className="mb-6 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Find Your Soulmate</h2>
            <p className="text-gray-600 mt-2 font-medium">Join us and let the sparks fly.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">First Name *</label>
              <input
                name="first_name"
                placeholder="Ex. John"
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl bg-white border-none ring-1 ring-white/50 placeholder:text-gray-400 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-rose-500 focus:shadow-rose-200/50 transition-all duration-300 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email *</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl bg-white border-none ring-1 ring-white/50 placeholder:text-gray-400 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-rose-500 focus:shadow-rose-200/50 transition-all duration-300 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password *</label>
              <input
                name="password"
                type="password"
                placeholder="Min 6 characters"
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl bg-white border-none ring-1 ring-white/50 placeholder:text-gray-400 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-rose-500 focus:shadow-rose-200/50 transition-all duration-300 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Date of Birth *</label>
                <input
                  name="date_of_birth"
                  type="date"
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-xl bg-white border-none ring-1 ring-white/50 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-rose-500 transition-all duration-300 outline-none"
                />
                {form.date_of_birth && calculateAge(form.date_of_birth) < 18 && (
                  <p className="text-xs text-red-500 font-semibold ml-1">Must be 18+</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Phone</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-xl bg-white border-none ring-1 ring-white/50 placeholder:text-gray-400 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-rose-500 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            <button className="w-full mt-3 relative group overflow-hidden bg-white text-rose-600 font-extrabold py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(255,255,255,0.5)] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-95 border-2 border-white/50">
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                Create Account
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-white/30"></div>
            <span className="px-4 text-sm font-bold text-gray-600">or continue with</span>
            <div className="flex-1 h-px bg-white/30"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="flex-1 flex items-center justify-center gap-2 bg-white py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-bold text-gray-600">Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-bold text-white">Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              className="flex-1 flex items-center justify-center gap-2 bg-black py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <svg width="18" height="20" viewBox="0 0 17 20" fill="white">
                <path d="M13.545 10.239c.018-1.568.684-2.968 1.766-3.948a4.813 4.813 0 00-3.783-2.047c-1.598-.169-3.144.953-3.955.953-.826 0-2.076-.937-3.422-.91a5.05 5.05 0 00-4.25 2.592c-1.834 3.174-.468 7.858 1.295 10.429.879 1.262 1.916 2.673 3.273 2.625 1.323-.054 1.82-.847 3.42-.847 1.585 0 2.047.847 3.435.816 1.42-.022 2.316-1.27 3.178-2.54a10.703 10.703 0 001.444-2.956c-1.7-.655-2.6-2.424-2.6-4.167zM11.15 2.678A4.543 4.543 0 0012.2 0a4.632 4.632 0 00-2.994 1.553 4.318 4.318 0 00-1.08 3.13 3.834 3.834 0 003.024-2.005z" />
              </svg>
              <span className="text-sm font-bold text-white">Apple</span>
            </button>
          </div>

          <div className="mt-6 text-center text-gray-700">
            <span className="font-medium">Already have an account? </span>
            <Link to="/" className="text-rose-700 font-bold hover:text-rose-900 hover:underline transition-all drop-shadow-sm">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
