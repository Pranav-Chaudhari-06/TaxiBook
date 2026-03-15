/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Primary: Violet (premium, distinctive) ── */
        primary: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        /* ── Accent: Amber (warm pop / CTAs) ── */
        accent: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        /* ── Surface / Ink: warm-violet tinted neutrals ── */
        surface: {
          0:   '#FFFFFF',
          50:  '#F9F8FC',   /* app background */
          100: '#F2F0F9',
          200: '#E4E1F0',
          300: '#C9C5DC',
          400: '#9E9AB5',
          500: '#716D8A',
          600: '#504D69',
          700: '#39364F',
          800: '#23213A',   /* text primary */
          900: '#16142A',
          950: '#0C0B18',
        },
        /* ── Semantic ── */
        success: { DEFAULT: '#059669', light: '#D1FAE5', dark: '#065F46' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#92400E' },
        error:   { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#991B1B' },
        info:    { DEFAULT: '#0284C7', light: '#E0F2FE', dark: '#075985' },
      },

      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
      },

      /* ── Full type scale ── */
      fontSize: {
        'display': ['3.5rem',  { lineHeight: '1.08', letterSpacing: '-0.03em',  fontWeight: '800' }],
        'h1':      ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2':      ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em',  fontWeight: '700' }],
        'h3':      ['1.375rem',{ lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '600' }],
        'h4':      ['1.125rem',{ lineHeight: '1.4',  letterSpacing: '-0.01em',  fontWeight: '600' }],
        'body-lg': ['1.0625rem',{ lineHeight: '1.65', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body':    ['0.9375rem',{ lineHeight: '1.6',  letterSpacing: '0em',      fontWeight: '400' }],
        'body-sm': ['0.8125rem',{ lineHeight: '1.5',  letterSpacing: '0.005em',  fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4',  letterSpacing: '0.01em',   fontWeight: '400' }],
        'label':   ['0.8125rem',{ lineHeight: '1',    letterSpacing: '0.02em',   fontWeight: '600' }],
        'overline':['0.6875rem',{ lineHeight: '1',    letterSpacing: '0.1em',    fontWeight: '700' }],
      },

      /* ── Brand-tinted shadow scale ── */
      boxShadow: {
        'xs':     '0 1px 2px rgba(91,33,182,0.04)',
        'sm':     '0 1px 3px rgba(91,33,182,0.06), 0 1px 2px rgba(91,33,182,0.04)',
        DEFAULT:  '0 2px 8px rgba(91,33,182,0.07), 0 1px 3px rgba(91,33,182,0.05)',
        'md':     '0 4px 12px rgba(91,33,182,0.08), 0 2px 6px rgba(91,33,182,0.05)',
        'lg':     '0 10px 24px rgba(91,33,182,0.10), 0 4px 8px rgba(91,33,182,0.06)',
        'xl':     '0 20px 40px rgba(91,33,182,0.12), 0 8px 16px rgba(91,33,182,0.07)',
        '2xl':    '0 32px 64px rgba(91,33,182,0.18)',
        'card':   '0 1px 3px rgba(91,33,182,0.06), 0 4px 16px rgba(91,33,182,0.05)',
        'card-hover': '0 4px 12px rgba(91,33,182,0.09), 0 12px 32px rgba(91,33,182,0.08)',
        'btn':    '0 4px 14px rgba(124,58,237,0.35)',
        'btn-hover': '0 6px 20px rgba(124,58,237,0.45)',
        'modal':  '0 24px 64px rgba(91,33,182,0.22)',
        'focus':  '0 0 0 3px rgba(139,92,246,0.25)',
        'inner':  'inset 0 1px 3px rgba(91,33,182,0.07)',
        'none':   'none',
      },

      borderRadius: {
        'none': '0px',
        'xs':   '3px',
        'sm':   '6px',
        DEFAULT:'8px',
        'md':   '10px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '28px',
        'full': '9999px',
      },

      /* ── Animation system ── */
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out both',
        'fade-up':      'fadeUp 0.3s ease-out both',
        'fade-down':    'fadeDown 0.25s ease-out both',
        'slide-up':     'fadeUp 0.35s ease-out both',
        'slide-down':   'fadeDown 0.25s ease-out both',
        'scale-in':     'scaleIn 0.2s ease-out both',
        'slide-right':  'slideRight 0.25s ease-out both',
        'shimmer':      'shimmer 1.8s linear infinite',
        'pulse-ring':   'pulseRing 2s ease-out infinite',
        'float':        'float 4s ease-in-out infinite',
        'bounce-soft':  'bounceSoft 0.6s ease-in-out',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' },                             '100%': { opacity: '1' } },
        fadeUp:     { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeDown:   { '0%': { opacity: '0', transform: 'translateY(-10px)' },'100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { '0%': { opacity: '0', transform: 'scale(0.93)' },   '100%': { opacity: '1', transform: 'scale(1)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-12px)' },'100%': { opacity: '1', transform: 'translateX(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        pulseRing:  { '0%': { transform: 'scale(1)', opacity: '1' }, '80%,100%': { transform: 'scale(1.8)', opacity: '0' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        bounceSoft: { '0%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-6px)' }, '70%': { transform: 'translateY(-2px)' } },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E\")",
      },

      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':   'cubic-bezier(0.4, 0, 0.2, 1)',
        'in-expo':  'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
