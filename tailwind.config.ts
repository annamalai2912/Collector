import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          canvas: {
            default: "#0d1117",
            subtle: "#161b22",
            overlay: "#21262d",
            inset: "#010409",
          },
          border: {
            default: "#30363d",
            muted: "#21262d",
            active: "#8b949e",
          },
          accent: {
            fg: "#58a6ff",
            subtle: "#388bfd1a",
            emphasis: "#1f6feb",
          },
          success: {
            fg: "#3fb950",
            btn: "#238636",
            btnHover: "#2ea043",
            subtle: "#23863626",
          },
          danger: {
            fg: "#f85149",
            subtle: "#da363326",
          },
          warning: {
            fg: "#d29922",
            subtle: "#bb800926",
          },
          fg: {
            default: "#c9d1d9",
            muted: "#8b949e",
            subtle: "#6e7681",
            header: "#f0f6fc",
          },
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "Liberation Mono", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "pulse-subtle": "pulseSubtle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
