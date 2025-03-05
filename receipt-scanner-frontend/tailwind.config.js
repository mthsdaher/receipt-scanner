/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}', // Scan all files in the src directory for Tailwind classes
    ],
    theme: {
      extend: {}, // Extend default Tailwind theme if needed (e.g., custom colors, fonts)
    },
    plugins: [], // Add plugins as needed (e.g., @tailwindcss/forms, @tailwindcss/typography)
  };