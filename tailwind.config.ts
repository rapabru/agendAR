import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        notion: {
          bg: "#191919",
          sidebar: "#202020",
          hover: "#2c2c2c",
          border: "#2f2f2f",
          text: "#e3e2e0",
          subtle: "#9b9a97",
          blue: "#2383e2",
          red: "#eb5757",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
