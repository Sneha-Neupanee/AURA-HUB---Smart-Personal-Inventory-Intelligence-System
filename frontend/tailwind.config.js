/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#e0eaff',
                    200: '#c7d9ff',
                    300: '#a4bfff',
                    400: '#7a9bff',
                    500: '#5272f2',
                    600: '#3b52e0',
                    700: '#2f40c9',
                    800: '#2a37a3',
                    900: '#283382',
                },
            },
            borderRadius: {
                DEFAULT: '8px',
            },
            spacing: {
                '18': '4.5rem',
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
            },
            boxShadow: {
                'card': '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.08)',
                'card-hover': '0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.12)',
                'modal': '0 20px 60px rgba(0,0,0,0.3)',
            },
        },
    },
    plugins: [],
}
