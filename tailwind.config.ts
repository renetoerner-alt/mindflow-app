import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { 'mindflow-pink': '#FF6B9D', 'mindflow-purple': '#C4B5FD', 'mindflow-lime': '#BFFF00', 'mindflow-cyan': '#67E8F9', 'mindflow-orange': '#FDBA74' } } },
  plugins: [],
};
export default config;
