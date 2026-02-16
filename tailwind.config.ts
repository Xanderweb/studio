import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"Satoshi"', 'sans-serif'],
        headline: ['"Syne"', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)', /* 24px */
        md: 'calc(var(--radius) - 8px)', /* 16px */
        sm: 'calc(var(--radius) - 12px)', /* 12px */
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'rotate-gradient': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
         'glitch-anim-1': {
          '0%': { clipPath: 'inset(12% 0 85% 0)' },
          '20%': { clipPath: 'inset(58% 0 13% 0)' },
          '40%': { clipPath: 'inset(36% 0 42% 0)' },
          '60%': { clipPath: 'inset(70% 0 5% 0)' },
          '80%': { clipPath: 'inset(95% 0 2% 0)' },
          '100%': { clipPath: 'inset(48% 0 48% 0)' },
        },
        'glitch-anim-2': {
          '0%': { clipPath: 'inset(78% 0 2% 0)' },
          '20%': { clipPath: 'inset(5% 0 90% 0)' },
          '40%': { clipPath: 'inset(82% 0 1% 0)' },
          '60%': { clipPath: 'inset(42% 0 53% 0)' },
          '80%': { clipPath: 'inset(18% 0 78% 0)' },
          '100%': { clipPath: 'inset(92% 0 5% 0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'rotate-gradient': 'rotate-gradient 3s linear infinite',
        'glitch-1': 'glitch-anim-1 2s infinite linear alternate-reverse',
        'glitch-2': 'glitch-anim-2 2s infinite linear alternate-reverse',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
