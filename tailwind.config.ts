// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#60A5FA',  // Soft blue (robotics/STEM appropriate)
          red: '#F472B6',   // Soft pink/coral (lighter, less saturated)
          dark: '#64748B',  // Lighter gray (improved readability)
          light: '#F8FAFC', // Slightly lighter blue-grey for backgrounds
        },
      },
    },
  },
  plugins: [],
};
export default config;