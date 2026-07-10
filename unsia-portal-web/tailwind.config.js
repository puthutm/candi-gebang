/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5fb', 100: '#d9e7f1', 200: '#aac6dd', 300: '#7aa5c8',
          400: '#3d80aa', 500: '#00719f', 600: '#0f487b', 700: '#0a345c',
          800: '#08294d', 900: '#05203f',
          accent: '#FED524',
          'accent-deep': '#E8B900'
        }
      },
      fontFamily: {
        display: ['Urbanist', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
}
