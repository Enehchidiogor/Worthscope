import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["'Poppins'", "system-ui", "sans-serif"],
        poppins: ["'Poppins'", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        text2: "hsl(var(--text2))",
        text3: "hsl(var(--text3))",
        "bg-card": "hsl(var(--bg-card))",
        "bg-elevated": "hsl(var(--bg-elevated))",
        "border-bright": "hsl(var(--border-bright))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          dark: "hsl(var(--accent-dark))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
        streak: "hsl(var(--streak))",
        locked: "hsl(var(--locked))",
      },
      backgroundImage: {
        "gradient-accent": "var(--gradient-accent)",
        "gradient-progress": "var(--gradient-progress)",
        "gradient-journey": "var(--gradient-journey)",
        "gradient-current-phase": "var(--gradient-current-phase)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
        accent: "var(--shadow-accent)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-lg)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "ws-fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "ws-pulse-glow": {
          "0%,100%": { boxShadow: "0 0 16px hsl(var(--accent) / 0.4)" },
          "50%": { boxShadow: "0 0 28px hsl(var(--accent) / 0.6)" },
        },
        "ws-flame": { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.18)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ws-fade-up": "ws-fade-up 0.5s ease-out both",
        "ws-pulse-glow": "ws-pulse-glow 3s ease-in-out infinite",
        "ws-flame": "ws-flame 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
