import type { Config } from "tailwindcss";

// Pinned to Tailwind v3's plain-JS PostCSS pipeline rather than v4's native (@tailwindcss/postcss)
// engine: the latter crashes on paths containing "#" (this repo lives under a "#_amagi"
// directory), a known class of bug in path-to-file-URL handling. See app/AGENTS.md note and
// basis/decision_log.md for context on this repo's environment quirks.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
