import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
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
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all hover:scale-110"
      title="Toggle Dark Mode"
    >
      {darkSide ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}