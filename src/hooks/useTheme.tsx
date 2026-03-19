import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "night";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "movie-catalog-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (stored && ["light", "dark", "night"].includes(stored)) {
        return stored;
      }
      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ["light", "dark", "night"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "night");
    
    // Add current theme class
    root.classList.add(theme);
    
    // Update CSS variables based on theme
    if (theme === "dark") {
      root.style.setProperty("--background", "240 10% 3.9%");
      root.style.setProperty("--foreground", "0 0% 98%");
      root.style.setProperty("--card", "240 10% 3.9%");
      root.style.setProperty("--card-foreground", "0 0% 98%");
      root.style.setProperty("--popover", "240 10% 3.9%");
      root.style.setProperty("--popover-foreground", "0 0% 98%");
      root.style.setProperty("--primary", "0 0% 98%");
      root.style.setProperty("--primary-foreground", "240 5.9% 10%");
      root.style.setProperty("--secondary", "240 3.7% 15.9%");
      root.style.setProperty("--secondary-foreground", "0 0% 98%");
      root.style.setProperty("--muted", "240 3.7% 15.9%");
      root.style.setProperty("--muted-foreground", "240 5% 64.9%");
      root.style.setProperty("--accent", "240 3.7% 15.9%");
      root.style.setProperty("--accent-foreground", "0 0% 98%");
      root.style.setProperty("--destructive", "0 62.8% 30.6%");
      root.style.setProperty("--destructive-foreground", "0 0% 98%");
      root.style.setProperty("--border", "240 3.7% 15.9%");
      root.style.setProperty("--input", "240 3.7% 15.9%");
      root.style.setProperty("--ring", "240 4.9% 83.9%");
    } else if (theme === "night") {
      // Night mode - warmer, darker tones (amber/orange tinted)
      root.style.setProperty("--background", "220 15% 8%");
      root.style.setProperty("--foreground", "35 20% 92%");
      root.style.setProperty("--card", "220 15% 10%");
      root.style.setProperty("--card-foreground", "35 20% 92%");
      root.style.setProperty("--popover", "220 15% 10%");
      root.style.setProperty("--popover-foreground", "35 20% 92%");
      root.style.setProperty("--primary", "35 60% 55%");
      root.style.setProperty("--primary-foreground", "220 15% 8%");
      root.style.setProperty("--secondary", "220 12% 18%");
      root.style.setProperty("--secondary-foreground", "35 20% 92%");
      root.style.setProperty("--muted", "220 12% 18%");
      root.style.setProperty("--muted-foreground", "35 15% 60%");
      root.style.setProperty("--accent", "35 50% 25%");
      root.style.setProperty("--accent-foreground", "35 20% 92%");
      root.style.setProperty("--destructive", "0 50% 35%");
      root.style.setProperty("--destructive-foreground", "35 20% 92%");
      root.style.setProperty("--border", "220 12% 20%");
      root.style.setProperty("--input", "220 12% 20%");
      root.style.setProperty("--ring", "35 60% 55%");
    } else {
      // Light mode - reset to defaults
      root.style.setProperty("--background", "0 0% 100%");
      root.style.setProperty("--foreground", "240 10% 3.9%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "240 10% 3.9%");
      root.style.setProperty("--popover", "0 0% 100%");
      root.style.setProperty("--popover-foreground", "240 10% 3.9%");
      root.style.setProperty("--primary", "240 5.9% 10%");
      root.style.setProperty("--primary-foreground", "0 0% 98%");
      root.style.setProperty("--secondary", "240 4.8% 95.9%");
      root.style.setProperty("--secondary-foreground", "240 5.9% 10%");
      root.style.setProperty("--muted", "240 4.8% 95.9%");
      root.style.setProperty("--muted-foreground", "240 3.8% 46.1%");
      root.style.setProperty("--accent", "240 4.8% 95.9%");
      root.style.setProperty("--accent-foreground", "240 5.9% 10%");
      root.style.setProperty("--destructive", "0 84.2% 60.2%");
      root.style.setProperty("--destructive-foreground", "0 0% 98%");
      root.style.setProperty("--border", "240 5.9% 90%");
      root.style.setProperty("--input", "240 5.9% 90%");
      root.style.setProperty("--ring", "240 5.9% 10%");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
