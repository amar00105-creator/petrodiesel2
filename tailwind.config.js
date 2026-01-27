/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./resources/js/**/*.{js,jsx,ts,tsx}",
        "./views/**/*.{php,html}",
        "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        transparent: "transparent",
        current: "currentColor",
        extend: {
            colors: {
                navy: {
                    900: '#0f172a',
                    800: '#1e293b',
                },
                emerald: {
                    500: '#10b981',
                },
                tremor: {
                    brand: {
                        faint: "#eff6ff",
                        muted: "#bfdbfe",
                        subtle: "#60a5fa",
                        DEFAULT: "#3b82f6",
                        emphasis: "#1d4ed8",
                        inverted: "#ffffff",
                    },
                    background: {
                        muted: "#f9fafb",
                        subtle: "#f3f4f6",
                        DEFAULT: "#ffffff",
                        emphasis: "#374151",
                    },
                    border: {
                        DEFAULT: "#e5e7eb",
                    },
                    ring: {
                        DEFAULT: "#e5e7eb",
                    },
                    content: {
                        subtle: "#9ca3af",
                        DEFAULT: "#6b7280",
                        emphasis: "#374151",
                        strong: "#111827",
                        inverted: "#ffffff",
                    },
                }
            },
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                pulse: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: .5 },
                }
            }
        },
    },
    plugins: [],
}
