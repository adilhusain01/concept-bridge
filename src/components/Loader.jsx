import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="relative">
        {/* Gradient blur effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>

        {/* Glass container */}
        <div className="relative bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
          {/* Spinning circles */}
          <div className="flex items-center justify-center">
            <div className="absolute animate-spin">
              <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent"></div>
            </div>
            <div className="absolute animate-spin animate-delay-150">
              <div className="h-12 w-12 rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-blue-500 border-l-transparent"></div>
            </div>
            <div className="absolute animate-spin animate-delay-300">
              <div className="h-8 w-8 rounded-full border-4 border-t-pink-500 border-r-blue-500 border-b-purple-500 border-l-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
