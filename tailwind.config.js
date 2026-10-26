// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mine: {
          bg:      "#0a0a0f",
          surface: "#12121a",
          card:    "#1a1a28",
          border:  "rgba(255,107,0,0.2)",
          neon:    "#ff6b00",
          gold:    "#ffd700",
          cyan:    "#00d4ff",
          danger:  "#ff1744",
          safe:    "#00e676",
          warn:    "#ffab00",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        "pulse-alert": {
          "0%, 100%": { opacity: 1,   backgroundColor: "rgba(255,23,68,0.15)" },
          "50%":       { opacity: 0.6, backgroundColor: "rgba(255,23,68,0.35)" },
        },
        "glow-ring": {
          "0%, 100%": { boxShadow: "0 0 12px 2px rgba(255,107,0,0.4)" },
          "50%":       { boxShadow: "0 0 28px 8px rgba(255,107,0,0.8)" },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)"  },
        },
        "data-flash": {
          "0%, 100%": { color: "#00d4ff" },
          "50%":       { color: "#ffffff" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to:   { opacity: 1, transform: "translateY(0)"    },
        },
      },
      animation: {
        "pulse-alert":  "pulse-alert 0.8s ease-in-out infinite",
        "glow-ring":    "glow-ring 1.5s ease-in-out infinite",
        "scan-line":    "scan-line 4s linear infinite",
        "data-flash":   "data-flash 1s ease-in-out infinite",
        "slide-up":     "slide-up 0.5s ease-out forwards",
      },
      backgroundImage: {
        "grid-dark":    "linear-gradient(rgba(255,107,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,0.03) 1px,transparent 1px)",
      },
      backgroundSize: {
        "grid-32": "32px 32px",
      },
    },
  },
  plugins: [],
};
