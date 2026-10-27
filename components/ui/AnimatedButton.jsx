"use client"

export default function AnimatedCTAButton({ children, onClick = () => { }, className = "", type, hoverScale = true, disabled = false }) {
  const Tag = type === "submit" ? "button" : "span"
  return (
    <>
      <Tag
        type={type}
        onClick={() => { onClick() }}
        disabled={Tag === "button" ? disabled : undefined}
        className={`group relative inline-flex items-center justify-center px-8 py-3 text-white transition-all duration-300 ease-out transform rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-400/50 overflow-hidden ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-2xl"} ${className} ${hoverScale && !disabled ? "hover:scale-105" : ""}`}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-blue bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500 rounded-lg"></div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-cyan-400 rounded-lg blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-lg"></div>

        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {/* <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg> */}
        </span>

        {/* Pulse animation */}
        {/* <div className="absolute inset-0 rounded-lg animate-pulse bg-gradient-to-r from-brand-blue/20 to-cyan-400/20"></div> */}

      </Tag >

      <style jsx>{`
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .bg-pos-0 {
          background-position: 0% 50%;
        }
        .bg-pos-100 {
          background-position: 100% 50%;
        }
      `}</style>

    </>
  )
}
