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
        // Stripe-inspired primary colors
        'tt-primary': '#635BFF',
        'tt-primary-dark': '#4B44C2',
        'tt-primary-light': '#857DFF',
        'tt-secondary': '#0A2540',
        'tt-secondary-light': '#1D3E5F',
        'tt-accent': '#00D4FF',

        // Background colors
        'tt-surface': '#FFFFFF',
        'tt-container': '#F6F9FC',
        'tt-container-dark': '#E6EBF1',

        // Text colors
        'tt-text-primary': '#1A1F36',
        'tt-text-secondary': '#697386',
        'tt-text-disabled': '#A5AFBD',

        // Border colors
        'tt-border-neutral': '#E6EBF1',
        'tt-border-focus': '#635BFF',

        // Status colors
        'tt-success': '#32D583',
        'tt-info': '#3E7BFA',
        'tt-warning': '#FFC107',
        'tt-error': '#FF4757',

        // Status background colors (lighter versions)
        'tt-success-light': '#E3F9EF',
        'tt-info-light': '#EBF2FF',
        'tt-warning-light': '#FFF8E6',
        'tt-error-light': '#FFEBEE',

        // Legacy advisor colors (keeping for compatibility)
        'advisor-blue': '#1e40af',
        'advisor-purple': '#7c3aed',
        'advisor-green': '#059669',
        'voice-active': '#ef4444',
        'voice-inactive': '#6b7280'
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'tt-xs': '0.75rem',     // 12px
        'tt-sm': '0.875rem',    // 14px
        'tt-md': '1rem',        // 16px
        'tt-lg': '1.125rem',    // 18px
        'tt-xl': '1.25rem',     // 20px
        'tt-2xl': '1.5rem',     // 24px
        'tt-3xl': '1.875rem',   // 30px
        'tt-4xl': '2.25rem',    // 36px
      },
      borderRadius: {
        'tt-sm': '4px',
        'tt-md': '8px',
        'tt-lg': '12px',
        'tt-xl': '16px',
        'tt-2xl': '20px',
      },
      boxShadow: {
        'tt-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'tt-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'tt-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'tt-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-light': 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
}