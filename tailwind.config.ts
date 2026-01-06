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
          blue: '#003B73',  // The Navy from the letters
          red: '#D61C4E',   // The Red from the rocket
          dark: '#2C2C2C',  // The Grey from the ring/star
          light: '#F3F6F9', // A very light blue-grey for page backgrounds (easier on eyes than pure white)
        },
      },
    },
  },
  plugins: [],
};
export default config;