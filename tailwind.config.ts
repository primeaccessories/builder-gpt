import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark professional theme
        'bg-primary': '#0a0e14',
        'bg-secondary': '#131920',
        'bg-elevated': '#1a2028',
        'border-subtle': '#2a3038',
        'text-primary': '#ffffff',
        'text-secondary': '#a8b2c1',
        'text-muted': '#6b7785',
        'accent-blue': '#3b82f6',
        'accent-blue-hover': '#2563eb',
        'alert-red': '#ff4444',
        'success-green': '#44ff88',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
