/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#000000',
                'bg-secondary': '#050505', // Slightly lighter than pure black for contrast areas
                'bg-card': '#0A0A0A',
                'bg-card-hover': '#111111',
                'border': '#1F1F1F',
                'border-hover': '#333333',
                'text-primary': '#FFFFFF',
                'text-secondary': '#888888',
                'text-muted': '#444444',
                'accent': '#FFFFFF',
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'], // Ensure quotes for font names with spaces if needed, generally okay without for well-knowns but good practice
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
