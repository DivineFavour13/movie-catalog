import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchMovies } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";
import { Search, Film, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavigationPage = "home" | "popular" | "top-rated" | "upcoming";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onNavigate?: (page: NavigationPage) => void;
  currentPage?: string;
}

interface SearchBoxProps {
  localQuery: string;
  isLoadingSuggestions: boolean;
  isSuggestionsOpen: boolean;
  suggestions: Movie[];
  submitLabel: React.ReactNode;
  submitSize?: "sm" | "default" | "icon";
  onQueryChange: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSuggestionSelect: (title: string) => void;
  onSuggestionOpen: () => void;
  onSuggestionClose: () => void;
  className?: string;
  inputClassName?: string;
}

function SearchBox({
  localQuery,
  isLoadingSuggestions,
  isSuggestionsOpen,
  suggestions,
  submitLabel,
  submitSize = "sm",
  onQueryChange,
  onSubmit,
  onSuggestionSelect,
  onSuggestionOpen,
  onSuggestionClose,
  className,
  inputClassName,
}: SearchBoxProps) {
  const showSuggestions =
    isSuggestionsOpen &&
    localQuery.trim().length >= 2 &&
    (isLoadingSuggestions || suggestions.length > 0);

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search movies..."
          value={localQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={onSuggestionOpen}
          onBlur={() => {
            window.setTimeout(onSuggestionClose, 100);
          }}
          className={inputClassName}
          autoComplete="off"
        />

        {showSuggestions && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border bg-background shadow-lg">
            {isLoadingSuggestions ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Looking for matches...
              </div>
            ) : (
              <div className="py-1">
                {suggestions.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSuggestionSelect(movie.title)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
                  >
                    <span className="truncate font-medium">{movie.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "N/A"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Button type="submit" size={submitSize}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function Header({
  onSearch,
  searchQuery = "",
  onNavigate,
  currentPage = "home",
}: HeaderProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isScrolled, setIsScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const query = localQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);

      try {
        const response = await searchMovies(query, 1);
        const uniqueSuggestions = response.results.filter(
          (movie, index, results) =>
            index === results.findIndex((item) => item.title === movie.title)
        );
        setSuggestions(uniqueSuggestions.slice(0, 6));
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [localQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = localQuery.trim();
    setIsSuggestionsOpen(false);
    onSearch?.(query);
  };

  const handleSuggestionSelect = (title: string) => {
    setLocalQuery(title);
    setIsSuggestionsOpen(false);
    onSearch?.(title);
  };

  const navItems = [
    { key: "home" as const, label: "Home" },
    { key: "popular" as const, label: "Popular" },
    { key: "top-rated" as const, label: "Top Rated" },
    { key: "upcoming" as const, label: "Upcoming" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => onNavigate?.("home")}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Film className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline">MovieCatalog</span>
        </button>

        {/* Mobile Search */}
        <SearchBox
          localQuery={localQuery}
          isLoadingSuggestions={isLoadingSuggestions}
          isSuggestionsOpen={isSuggestionsOpen}
          suggestions={suggestions}
          submitLabel={<Search className="h-4 w-4" />}
          submitSize="icon"
          onQueryChange={(query) => {
            setLocalQuery(query);
            setIsSuggestionsOpen(true);
          }}
          onSubmit={handleSearchSubmit}
          onSuggestionSelect={handleSuggestionSelect}
          onSuggestionOpen={() => setIsSuggestionsOpen(true)}
          onSuggestionClose={() => setIsSuggestionsOpen(false)}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:hidden"
          inputClassName="h-9 min-w-0 pl-9"
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={currentPage === item.key ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate?.(item.key)}
              className="text-sm"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Search Bar */}
        <SearchBox
          localQuery={localQuery}
          isLoadingSuggestions={isLoadingSuggestions}
          isSuggestionsOpen={isSuggestionsOpen}
          suggestions={suggestions}
          submitLabel="Search"
          onQueryChange={(query) => {
            setLocalQuery(query);
            setIsSuggestionsOpen(true);
          }}
          onSubmit={handleSearchSubmit}
          onSuggestionSelect={handleSuggestionSelect}
          onSuggestionOpen={() => setIsSuggestionsOpen(true)}
          onSuggestionClose={() => setIsSuggestionsOpen(false)}
          className="flex-1 max-w-md hidden sm:flex items-center gap-2"
          inputClassName="pl-9 w-full"
        />

        {/* Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex items-center justify-between gap-3 border-b pb-4">
                <div>
                  <p className="text-sm font-medium">Appearance</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.key}
                    variant={currentPage === item.key ? "default" : "ghost"}
                    onClick={() => onNavigate?.(item.key)}
                    className="justify-start"
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
