import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b0f17",
        surface: "#111827",
        border: "#1f2937",
        muted: "#9ca3af",
        accent: "#7c3aed"
      }
    }
  },
  plugins: []
};

export default config;
