/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#07090E',
          900: '#0B0F19',
          850: '#101524',
          800: '#171E33',
          700: '#232D4B',
        },
        cyber: {
          cyan: '#00F0FF',
          purple: '#8B5CF6',
          pink: '#EC4899',
          rose: '#FF3366',
          amber: '#F59E0B',
          emerald: '#10B981',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-rose': '0 0 25px -5px rgba(255, 51, 102, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
