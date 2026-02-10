/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // ==========================================================================
    // BREAKPOINTS (Mobile-first)
    // ==========================================================================
    screens: {
      'xs': '375px',   // Small phones (iPhone SE)
      'sm': '640px',   // Large phones / small tablets
      'md': '768px',   // Tablets (iPad Mini)
      'lg': '1024px',  // Tablets landscape / small laptops
      'xl': '1280px',  // Laptops / desktops
      '2xl': '1536px', // Large desktops
    },

    extend: {
      // ========================================================================
      // COLORS - Referencing CSS Custom Properties
      // ========================================================================
      colors: {
        primary: {
          50:  'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        neutral: {
          0:   'var(--color-neutral-0)',
          50:  'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
        accent: {
          green: 'var(--color-accent-green)',
          amber: 'var(--color-accent-amber)',
          red:   'var(--color-accent-red)',
          blue:  'var(--color-accent-blue)',
          purple: 'var(--color-accent-purple)',
          pink:  'var(--color-accent-pink)',
        },
        brand: {
          purple: 'var(--color-primary-600)',
          "purple-dark": 'var(--color-primary-700)',
        },
        // Semantic status colors with background/border variants
        success: {
          DEFAULT: 'var(--color-success)',
          bg:      'var(--color-success-bg)',
          border:  'var(--color-success-border)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg:      'var(--color-warning-bg)',
          border:  'var(--color-warning-border)',
        },
        danger: {
          DEFAULT: 'var(--color-error)',
          bg:      'var(--color-error-bg)',
          border:  'var(--color-error-border)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg:      'var(--color-info-bg)',
          border:  'var(--color-info-border)',
        },
        // Semantic surface/background colors
        surface: {
          DEFAULT:  'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          hover:    'var(--color-surface-hover)',
        },
        background: {
          DEFAULT:   'var(--color-background)',
          soft:      'var(--color-background-soft)',
          secondary: 'var(--color-background-secondary)',
          tertiary:  'var(--color-background-tertiary)',
        },
      },

      // ========================================================================
      // SEMANTIC TEXT COLORS
      // ========================================================================
      textColor: {
        'dark': 'var(--color-text-primary)',
        'medium': 'var(--color-text-secondary)',
        'muted': 'var(--color-text-tertiary)',
        'light': 'var(--color-text-light)',
        'disabled': 'var(--color-text-disabled)',
        'inverse': 'var(--color-text-inverse)',
      },

      // ========================================================================
      // SEMANTIC BORDER COLORS
      // ========================================================================
      borderColor: {
        'default': 'var(--color-border)',
        'light': 'var(--color-border-light)',
        'heavy': 'var(--color-border-dark)',
      },

      // ========================================================================
      // TYPOGRAPHY
      // Font scales and weights are defined in themes.css via --font-* tokens
      // ========================================================================
      fontFamily: {
        sans: 'var(--font-family-sans)',
      },
      fontSize: {
        // Mobile-optimized sizes
        'xs':   ['var(--font-size-xs)', { lineHeight: 'var(--line-height-tight)' }],
        'sm':   ['var(--font-size-sm)', { lineHeight: 'var(--line-height-snug)' }],
        'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        'lg':   ['var(--font-size-lg)', { lineHeight: 'var(--line-height-relaxed)' }],
        'xl':   ['var(--font-size-xl)', { lineHeight: 'var(--line-height-relaxed)' }],
        '2xl':  ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl':  ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
        '4xl':  ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-tight)' }],
      },

      // ========================================================================
      // SPACING & SIZING
      // Note: Base spacing scale (0-24) is defined in themes.css via --spacing-* tokens
      // Tailwind's default rem-based spacing (1 = 0.25rem) automatically works with this
      // ========================================================================
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        'safe-bottom': 'env(safe-area-inset-bottom)', // iOS safe area
        'safe-top': 'env(safe-area-inset-top)',
      },
      maxWidth: {
        'content': '1120px',
        'session': '640px',  // Max width for session cards (mobile-optimized)
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },

      // ========================================================================
      // BORDERS & SHADOWS
      // ========================================================================
      borderRadius: {
        xl: 'var(--radius-xl)',
        "2xl": 'var(--radius-2xl)',
        pill: 'var(--radius-full)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'soft': 'var(--shadow-soft)',
        'card-hover': 'var(--shadow-card-hover)',
        'button': 'var(--shadow-button)',
      },

      // ========================================================================
      // BACKGROUNDS
      // ========================================================================
      backgroundImage: {
        'hero-soft': 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-background-soft) 50%, var(--color-neutral-0) 100%)',
        'celebration': 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 50%, var(--color-primary-100) 100%)',
        'gradient-progress': 'linear-gradient(to right, var(--color-primary-600) 0%, var(--color-primary-600) var(--progress, 0%), var(--color-neutral-200) var(--progress, 0%), var(--color-neutral-200) 100%)',
        'gradient-button': 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
        'gradient-primary': 'linear-gradient(to bottom right, var(--color-primary-300), var(--color-primary-600))',
        'gradient-success': 'linear-gradient(to bottom right, var(--color-success-border), var(--color-success))',
        'gradient-celebration-badge': 'linear-gradient(to bottom right, var(--color-success-border), var(--color-success))',
      },

      // ========================================================================
      // ANIMATIONS
      // ========================================================================
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'achievement-pop': {
          '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'confetti-1': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) translateX(-50px) rotate(360deg)', opacity: '0' },
        },
        'confetti-2': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) translateX(30px) rotate(-360deg)', opacity: '0' },
        },
        'confetti-3': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) translateX(50px) rotate(360deg)', opacity: '0' },
        },
        'confetti-4': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) translateX(-30px) rotate(-360deg)', opacity: '0' },
        },
        'confetti-5': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) translateX(10px) rotate(360deg)', opacity: '0' },
        },
        'bounce-up-fade': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(1.5)', opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.6s ease-out forwards',
        'achievement-pop': 'achievement-pop 0.5s ease-out forwards',
        'confetti-fall': 'confetti-fall 3s ease-in forwards',
        'confetti-1': 'confetti-1 2s ease-out forwards',
        'confetti-2': 'confetti-2 2.2s ease-out forwards',
        'confetti-3': 'confetti-3 1.8s ease-out forwards',
        'confetti-4': 'confetti-4 2.1s ease-out forwards',
        'confetti-5': 'confetti-5 1.9s ease-out forwards',
        'bounce-up-fade': 'bounce-up-fade 1s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out forwards',
      },

      // ========================================================================
      // TRANSITIONS
      // ========================================================================
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}