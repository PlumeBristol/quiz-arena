/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#0B0B18',
        night: '#141028',
        stage: '#1C1540',
        violet: '#7B2CFF',
        magenta: '#FF3DA8',
        cyan: '#21E6F0',
        lemon: '#FFE14A',
        coral: '#FF7A59',
        mint: '#59F3B1'
      },
      boxShadow: {
        pop: '0 8px 0 rgba(11,11,24,0.45)',
        popSm: '0 4px 0 rgba(11,11,24,0.45)',
        neon: '0 0 24px rgba(123,44,255,0.6), 0 0 8px rgba(33,230,240,0.5)'
      },
      keyframes: {
        wiggle: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
        pulseGlow: { '0%,100%': { filter: 'brightness(1)' }, '50%': { filter: 'brightness(1.25)' } }
      },
      animation: {
        wiggle: 'wiggle 1.6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
