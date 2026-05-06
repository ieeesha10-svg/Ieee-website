import React, { useState } from "react";
import SunIcon from '../assets/icons/sun.png'
import MoonIcon from '../assets/icons/moon.png'
import useDarkMode from "../hooks/useDarkMode";

export default function ThemeToggle() {
  const [colorTheme, setTheme] = useDarkMode();
  const [darkSide, setDarkSide] = useState(
    colorTheme === "light" ? true : false
  );

  const toggleDarkMode = (checked) => {
    setTheme(colorTheme);
    setDarkSide(checked);
  };

  return (
  <button
    onClick={() => toggleDarkMode(!darkSide)}
    title="Toggle Dark Mode"
    className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${darkSide ? "bg-[#475259]" : "bg-[#C6DEEF]"}`}
  >
    <span className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-md transition-transform duration-300 ${darkSide ? "translate-x-0" : "translate-x-8"}`}>
      <img src={darkSide ? MoonIcon : SunIcon} className="w-3.5 h-3.5" />
    </span>
  </button>
  );
}