import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await API.post("/auth/login", form);
    localStorage.setItem("token", res.data.token);

    if (res.data.isProfileComplete) {
      navigate("/discover");
    } else {
      navigate("/setup");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">

      {/* Background Decor (Minimal on white page) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* Main Card - Unified Gradient Background */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#ff9a9e] via-[#fecfef] to-[#ffdde1] rounded-[40px] shadow-[0_30px_60px_-12px_rgba(50,50,93,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row transform transition-all hover:scale-[1.005] duration-500">

        {/* Internal Floating Clouds (Across the whole card) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] animate-float-slow opacity-60">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="white" className="drop-shadow-sm"><path d="M40 60C40 71 49 80 60 80H100C111 80 120 71 120 60C120 49 111 40 100 40C98 40 96 40.4 94.2 41C92.4 29 82.2 20 70 20C69 20 68 20 67 20.2C64.2 8.6 53.8 0 41.6 0C27.6 0 15.8 9.6 12.4 22.8C5.4 24.6 0 30.8 0 38.4C0 46.8 6 53.8 14 55.6C14 57 14 58.6 14 60H40Z" /></svg>
          </div>
          <div className="absolute bottom-[20%] right-[55%] animate-float opacity-60" style={{ animationDelay: '2s' }}>
            <svg width="180" height="120" viewBox="0 0 120 80" fill="white" className="drop-shadow-sm"><path d="M40 60C40 71 49 80 60 80H100C111 80 120 71 120 60C120 49 111 40 100 40C98 40 96 40.4 94.2 41C92.4 29 82.2 20 70 20C69 20 68 20 67 20.2C64.2 8.6 53.8 0 41.6 0C27.6 0 15.8 9.6 12.4 22.8C5.4 24.6 0 30.8 0 38.4C0 46.8 6 53.8 14 55.6C14 57 14 58.6 14 60H40Z" /></svg>
          </div>
          <div className="absolute top-[30%] right-[20%] w-32 h-32 bg-white rounded-full mix-blend-overlay opacity-30 blur-2xl animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] left-[15%] w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply opacity-20 blur-3xl animate-blob"></div>
        </div>

        {/* Left Side - Illustration Panel (Transparent BG) */}
        <div className="w-full md:w-1/2 relative p-12 flex flex-col items-center justify-center z-10">

          {/* Decorative Concentric Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/30 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

          {/* Floating Illustration */}
          <div className="relative z-10 animate-float">
            <img
              src="/assets/heartballon.png"
              alt="Heart Balloon"
              className="w-full max-w-[280px] h-auto drop-shadow-2xl"
            />
          </div>

          {/* Text Overlay */}
          <div className="relative z-10 mt-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 drop-shadow-sm tracking-tight">Love is in the Air</h2>
            <p className="mt-3 text-gray-600 font-medium text-lg">Find the one who lifts you up.</p>
          </div>
        </div>

        {/* Right Side - Form Panel (Transparent BG, but inputs are white) */}
        <div className="w-full md:w-1/2 p-10 md:p-14 relative z-10 flex flex-col justify-center border-l border-white/20 backdrop-blur-sm bg-white/20">

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome back to your story</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 shadow-sm">Email</label>
              <input
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-xl bg-white border-none ring-1 ring-white/50 placeholder:text-gray-400 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-pink-500 focus:shadow-pink-200/50 transition-all duration-300 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 shadow-sm">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-xl bg-white border-none ring-1 ring-white/50 placeholder:text-gray-400 text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-pink-500 focus:shadow-pink-200/50 transition-all duration-300 outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <a href="#" className="text-sm font-bold text-pink-600 hover:text-pink-800 transition-colors drop-shadow-sm">Forgot Password?</a>
            </div>

            <button className="w-full relative group overflow-hidden bg-white text-pink-600 font-extrabold py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(255,255,255,0.5)] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-95 border-2 border-white/50">
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                Sign In
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-gray-700">
            <span className="font-medium">Don't have an account? </span>
            <Link to="/register" className="text-pink-700 font-bold hover:text-pink-900 hover:underline transition-all drop-shadow-sm">Register Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
