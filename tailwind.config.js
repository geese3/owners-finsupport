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
        // SOLVEK Design System Integration
        brand: {
          DEFAULT: '#0066ff', // var(--color-accent-blue)
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0066ff', // Primary brand
          600: '#0052cc', // Darker blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },
        // SOLVEK Color Variables as Tailwind classes
        primary: {
          dark: '#1a1a1a',    // var(--color-primary-dark)
          light: '#ffffff',   // var(--color-primary-light)
          gray: '#f5f5f5'     // var(--color-primary-gray)
        },
        accent: {
          blue: '#0066ff',    // var(--color-accent-blue)
          cyan: '#00d9ff',    // var(--color-accent-cyan)
          purple: '#7c3aed',  // var(--color-accent-purple)
          green: '#22c55e'    // var(--color-accent-green)
        },
        neutral: {
          dark: '#2d2d2d',    // var(--color-neutral-dark)
          medium: '#666666',  // var(--color-neutral-medium)
          light: '#cccccc',   // var(--color-neutral-light)
          lighter: '#e8e8e8'  // var(--color-neutral-lighter)
        }
      }
    },
  },
  plugins: [],
}

