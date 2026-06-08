import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#12382a",
        leaf: "#2f7d4f",
        moss: "#7c9f43",
        clay: "#bd6b42",
        linen: "#f7f3ea",
        cream: "#fffaf0",
        ink: "#18231d"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(18, 56, 42, 0.14)",
        glass: "0 18px 45px rgba(18, 56, 42, 0.18)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
