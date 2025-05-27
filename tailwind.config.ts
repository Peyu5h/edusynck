// tailwind.config.js

import type { Config } from "tailwindcss";

const config = {
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
        xs: "375px",
        sm: "420px",
        md: "768px",
        lg: "1024px",
        xl: "1240px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        robson: ["Robson Bold", "sans-serif"],
        khula: ["Khula", "sans-serif"],
        antic: ["Antic Didone", "sans-serif"],
      },
      boxShadow: {
        "outline-yellow": "2px 2px 0 #F9D342",
        "intense-black": "0 8px 20px rgba(0, 0, 0, 0.5)",
        "xl-black":
          "30px 15px 30px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        bgImage:
          "url('https://res.cloudinary.com/dkysrpdi6/image/upload/v1722527717/Academia/grid_edarkb.svg')",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--bground1)",
        foreground: "hsl(var(--foreground))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        bground1: "var(--bground1)",
        bground2: "var(--bground2)", //hover2
        bground3: "var(--bground3)", //hover1
        popupbox: "var(--popupbox)",
        text: "var(--text)",
        thintext: "var(--thintext)",
        svg: "var(--svg)",
        pri: "var(--pri)",
        red: "#BC2E1B",
        redBg: "#441F1D",
        green: "#15A753",
        greenBg: "#1D442E",
        blue: "#2283DE",
        blueBg: "#253B56",
        orange: "#CA7D18",
        orangeBg: "#5B401A",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
