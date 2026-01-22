/** @type {import('tailwindcss').Config} */
module.exports = {

  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      "backgroundColor" : {
        "background" : "#111111",
        "secondary" : "#191919"
      }
    },
  },
  plugins: [],
}