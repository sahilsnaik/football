export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 30px rgba(43, 255, 168, 0.28)'
      }
    }
  },
  plugins: []
};
