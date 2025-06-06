
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Updated custom colors for Draft Zero
        "draft-green": "#0E3C26",
        "draft-bg": "#FDFBF5",
        "draft-text": "#0E3C26",
        "draft-coral": "#FF9D8C",
        "draft-mint": "#9AEBD0",
        "draft-purple": "#C4A1FF",
        "draft-yellow": "#E9FF7D",
        "draft-footer": "#1A3F35", // Updated from #0A2920
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'pulse-opacity': {
          '0%': { opacity: '0.85' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.85' }
        },
        'pulse-scale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' }
        },
        'scan-effect': {
          '0%': { transform: 'translateY(-10px)', opacity: '0.7' },
          '50%': { transform: 'translateY(10px)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0.7' }
        },
        'network-effect': {
          '0%': { transform: 'scale(0.97)', opacity: '0.7' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
          '100%': { transform: 'scale(0.97)', opacity: '0.7' }
        },
        'balance-effect': {
          '0%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
          '100%': { transform: 'rotate(-2deg)' }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-opacity': 'pulse-opacity 3s infinite ease-in-out',
        'pulse-scale': 'pulse-scale 5s infinite ease-in-out',
        'scan-effect': 'scan-effect 2.5s infinite ease-in-out',
        'network-effect': 'network-effect 4s infinite ease-in-out',
        'balance-effect': 'balance-effect 3s infinite ease-in-out',
      },
      fontFamily: {
        'serif': ['GT Alpina Trial', 'Georgia', 'serif'],
        'sans': ['GT Alpina Trial', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'title': '72px',
        'heading': '40px',
      },
      transitionDuration: {
        '400': '400ms',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
