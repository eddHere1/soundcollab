/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0B0F',
        surface: '#15151D',
        card: '#1E1E28',
        accent: '#8B5CF6',
        'accent-hover': '#A78BFA',
        cyan: '#22D3EE',
        'text-primary': '#F5F5F5',
        'text-secondary': '#9CA3AF',
        success: '#4ADE80',
        // Legacy aliases — map old Spotify tokens to new theme
        'spotify-green': '#8B5CF6',
        'spotify-green-hover': '#A78BFA',
        'spotify-black': '#0B0B0F',
        'spotify-base': '#0B0B0F',
        'spotify-elevated': '#1E1E28',
        'spotify-highlight': '#15151D',
        'spotify-subtle': '#6B7280',
        'spotify-muted': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Poppins', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 8px 32px rgba(0, 0, 0, 0.4)',
        glow: '0 0 40px rgba(139, 92, 246, 0.25)',
        'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.2)',
        'glow-lg': '0 0 60px rgba(139, 92, 246, 0.35)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3), transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, transparent 50%, rgba(34, 211, 238, 0.05) 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
