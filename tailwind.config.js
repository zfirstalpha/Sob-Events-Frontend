/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',      // Electric Indigo
          'primary-hover': '#4F46E5',
          accent: '#F43F5E',       // Vibrant Rose (CTA Buttons)
          'accent-hover': '#E11D48',
        },
        canvas: '#0B0F19',          // Deep Obsidian Background
        card: '#111827',            // Dark Slate Card Surface
        elevated: '#1F2937',        // Lighter Slate (Inputs/Modals)
      }
    },
  },
  plugins: [],
}