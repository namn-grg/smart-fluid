/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    colors: {
      fbg: "#1E242A",
      forange: "#AB4F26",
      transparent: "transparent",
      white: "#fff",
      gray80: "#ccc",
      gray60: "#999",
      gray40: "#666",
      gray20: "#333",
      orange90: "#ffdccc",
      orange85: "#f7ceba",
      orange80: "#ffb999",
      orange70: "#f09c75",
      orange65: "#ed8c5e",
      orange60: "#eb7b47",
      orange52: "#ea5f1f",
      orange40: "#b84814",
      orange36: "#884c30",
      orange24: "#5b3320",
      orange20: "#422e24",
      orange18: "#322d2a",
      orange12: "#201D1B",
      orange10: "#331000",
      orange08: "#181310",
      green60: "#47eb78",
      green53: "#33da65",
      green48: "#4ea669",
      green22: "#2b462b",
      green14: "#024617",
      green8: "#01280d",
      yellow84: "#efdfbe",
      yellow60: "#ebb747",
      yellow22: "#4f4022",
      yellow16: "#392f18",
      red60: "#eb4a47",
      red53: "#da3633",
      red48: "#a6514e",
      red20: "#630503",
      red15: "#490402",
      blue84: "#bed6ef",
      blue60: "#8d99a5",
      blue36: "#515c67",
      blue22: "#22384f",
      blue24: "#363e45",
      blue20: "#2d3339",
      blue18: "#292e33",
      blue16: "#24292e",
      blue14: "#1d242b",
      blue12: "#1b1b20",
      blue10: "#151520",
    },
  },
  daisyui: {
    themes: ["dark"],
  },
  plugins: [require("daisyui")],
}
