import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="h-screen w-full relative overflow-hidden flex items-center justify-center bg-black">
            {/* Background with Premium Gradient/Image Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2940&auto=format&fit=crop")', // High-quality couple/romance image
                }}
            ></div>

            {/* Dynamic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/40 to-pink-900/40 mix-blend-overlay"></div>

            {/* Main Content Card */}
            <div className="relative z-10 text-center px-6 max-w-lg w-full">

                {/* Animated Title Section */}
                <div className="animate-fade-in-up space-y-2 mb-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-pink-300 text-xs font-semibold tracking-wider uppercase mb-4">
                        #1 Trusted Matrimony App
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg font-serif">
                        Find Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                            Soulmate
                        </span>
                    </h1>
                    <p className="text-lg text-gray-200 font-light mt-4 leading-relaxed max-w-sm mx-auto">
                        Review your story with someone who shares your values, dreams, and faith.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 animate-fade-in-up delay-200">
                    <Link
                        to="/register"
                        className="block w-full py-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-rose-500/30 hover:scale-[1.02] hover:shadow-rose-500/50 active:scale-[0.98] transition-all duration-300"
                    >
                        Get Started
                    </Link>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-6">
                        <span>Already have an account?</span>
                        <Link
                            to="/login"
                            className="text-white font-semibold border-b border-transparent hover:border-white transition-all"
                        >
                            Login
                        </Link>
                    </div>
                </div>

            </div>

            {/* Decorative Floating Elements (Subtle) */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-rose-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        </div>
    );
}
