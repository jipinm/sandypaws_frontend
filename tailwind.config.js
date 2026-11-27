/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#201A18',
        brand: '#FF581B',
        brandd: '#C93A0A',
        sun: '#E7AD03',
        leaf: '#73A928',
        paper: '#FDFCF9',
        line: '#E8E4DF',
        mute: '#716A65',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
