/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', "sans-serif"],
        body: ['"Outfit"', "sans-serif"],
        serif: ['"Crimson Pro"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        vermillion: {
          50: "#fff3f0",
          100: "#ffe4de",
          200: "#ffccc2",
          300: "#ffa899",
          400: "#ff7a6a",
          500: "#ff4d3a",
          600: "#e8321f",
          700: "#c42515",
          800: "#9e200f",
          900: "#7a1a0b",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
          600: "#334155",
          700: "#1e293b",
          800: "#0f172a",
          900: "#020617",
          950: "#020617",
        },
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
        },
      },
      boxShadow: {
        "glow-sm": "0 0 15px -3px rgba(255,77,58,0.25)",
        "glow-md": "0 0 30px -5px rgba(255,77,58,0.35)",
        "glow-lg": "0 0 60px -10px rgba(255,77,58,0.4)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        noise:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        "grid-dark":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      animation: {
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-down": "slideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer: "shimmer 1.8s infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: 0, transform: "translateY(-12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: {
          from: { opacity: 0, transform: "scale(0.95)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 15px -3px rgba(255,77,58,0.3)" },
          "50%": { boxShadow: "0 0 30px -3px rgba(255,77,58,0.6)" },
        },
      },
    },
  },
  plugins: [],
};
