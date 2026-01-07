/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFC72C",
        dark: "#000000",
        darkSecondary: "#1E1E1E",
        grayLight: "#F1F3F4",
        pureWhite: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
