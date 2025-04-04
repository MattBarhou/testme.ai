/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}", // Ensure paths are correct
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")], // Make sure plugins are inside module.exports
    daisyui: {
        themes: ["light", "dark"],
        darkTheme: "dark",
    },
};
