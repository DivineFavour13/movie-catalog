import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Coffee } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "night":
        return <Coffee className="h-5 w-5" />;
      case "light":
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark";
      case "night":
        return "Night";
      case "light":
      default:
        return "Light";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {getIcon()}
          <span className="sr-only">Toggle theme ({getLabel()})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
          {theme === "light" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
          {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("night")}
          className={theme === "night" ? "bg-accent" : ""}
        >
          <Coffee className="h-4 w-4 mr-2" />
          Night
          {theme === "night" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}