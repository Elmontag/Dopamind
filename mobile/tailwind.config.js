/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: '#6C63FF',
        'bg-light': '#f8f8fc',
        'bg-dark': '#0f0f17',
        'card-light': '#ffffff',
        'card-dark': '#1a1a2e',
        'muted-light': '#6b7280',
        'muted-dark': '#9ca3af',
      },
    },
  },
};
