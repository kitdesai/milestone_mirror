import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, nostalgic color palette
        peach: {
          50: "#fef7f4",
          100: "#fdeee8",
          200: "#fbd9cb",
          300: "#f8bfa6",
          400: "#f4a07c",
          500: "#ef8054",
          600: "#e05f34",
          700: "#bb4a28",
          800: "#993e25",
          900: "#7d3523",
        },
        rose: {
          50: "#fdf4f6",
          100: "#fce8ed",
          200: "#f9d3dc",
          300: "#f4aebe",
          400: "#ed7d97",
          500: "#e15274",
          600: "#cd3259",
          700: "#ab2548",
          800: "#8f2240",
          900: "#79203b",
        },
        sky: {
          50: "#f5f9fc",
          100: "#e9f2f9",
          200: "#cfe4f2",
          300: "#a5cfe7",
          400: "#74b4d8",
          500: "#5199c7",
          600: "#3d7da9",
          700: "#336589",
          800: "#2e5571",
          900: "#2a485f",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdfaf5",
          200: "#faf4e8",
          300: "#f5ebd5",
          400: "#eeddb8",
          500: "#e6cd99",
          600: "#dab872",
          700: "#c79e4f",
          800: "#a5813f",
          900: "#876936",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
