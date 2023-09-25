const sizeFractions = {
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "3/4": "75%",
  "1/5": "20%",
  "2/5": "40%",
  "3/5": "60%",
  "4/5": "80%",
  "1/6": "16.666667%",
  "5/6": "83.333333%",
  "1/12": "8.3333333%",
  "5/12": "41.666667%",
  "7/12": "58.333333%",
  "11/12": "91.666667%",
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: sizeFractions,
      minWidth: sizeFractions,
      maxHeight: sizeFractions,
      minHeight: sizeFractions,
      colors: {
        accent: "rgb(8 145 178)",
        "accent-highlighted": "rgb(6 182 212)",
        "accent-muted": "rgb(14 116 144)",
      },
    },
  },
  plugins: [],
};
