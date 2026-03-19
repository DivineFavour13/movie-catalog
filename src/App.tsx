import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { MovieList, Pagination } from "@/components/MovieList";
import { MovieDetail } from "@/components/MovieDetail";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film,
  TrendingUp,
  Star,
  Calendar,
  Play,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  searchMovies,
} from "@/lib/tmdb";
import type { Movie } from "@/types/movie";

type Category = "popular" | "top-rated" | "upcoming" | "now-playing";

type ViewState =
  | { type: "home"; category: Category }
  | { type: "search"; query: string }
  | { type: "detail"; movieId: number };

function App() {
  const [view, setView] = useState<ViewState>({ type: "home", category: "popular" });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const getCategoryFromView = (v: ViewState): Category => {
    if (v.type === "home") return v.category;
    return "popular";
  };

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (view.type === "search") {
        response = await searchMovies(view.query, currentPage);
      } else {
        const category = getCategoryFromView(view);
        switch (category) {
          case "top-rated":
            response = await getTopRatedMovies(currentPage);
            break;
          case "upcoming":
            response = await getUpcomingMovies(currentPage);
            break;
          case "now-playing":
            response = await getNowPlayingMovies(currentPage);
            break;
          case "popular":
          default:
            response = await getPopularMovies(currentPage);
            break;
        }
      }

      setMovies(response.results);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [view, currentPage]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [view]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setView({ type: "search", query });
    } else {
      setView({ type: "home", category: "popular" });
    }
  };

  const handleNavigate = (page: "home" | Category) => {
    if (page === "home") {
      setView({ type: "home", category: "popular" });
    } else {
      setView({ type: "home", category: page });
    }
  };

  const handleMovieClick = (movieId: number) => {
    setView({ type: "detail", movieId });
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView({ type: "home", category: "popular" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageTitle = () => {
    if (view.type === "search") {
      return `Search Results for "${view.query}"`;
    }
    const category = getCategoryFromView(view);
    switch (category) {
      case "top-rated":
        return "Top Rated Movies";
      case "upcoming":
        return "Upcoming Movies";
      case "now-playing":
        return "Now Playing";
      case "popular":
      default:
        return "Popular Movies";
    }
  };

  const getCurrentPageKey = () => {
    if (view.type === "search") return "search";
    return getCategoryFromView(view);
  };

  // Movie Detail View
  if (view.type === "detail") {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <Header
            onSearch={handleSearch}
            onNavigate={handleNavigate}
            currentPage={getCurrentPageKey()}
          />
          <main>
            <MovieDetail
              movieId={view.movieId}
              onBack={handleBack}
              onMovieClick={handleMovieClick}
            />
          </main>
        </div>
      </ErrorBoundary>
    );
  }

  const isHomeView = view.type === "home";

  // Home/Search View
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header
          onSearch={handleSearch}
          searchQuery={view.type === "search" ? view.query : ""}
          onNavigate={handleNavigate}
          currentPage={getCurrentPageKey()}
        />

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section (only on home popular) */}
          {isHomeView && view.category === "popular" && !isLoading && (
            <div className="mb-12">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5 p-8 md:p-12">
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Discover Your Next Favorite Movie
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    Browse thousands of movies, from timeless classics to the latest
                    blockbusters. Find ratings, reviews, and cast information all in one
                    place.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleNavigate("popular")}
                      variant="default"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Popular
                    </Button>
                    <Button
                      onClick={() => handleNavigate("top-rated")}
                      variant="outline"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Top Rated
                    </Button>
                    <Button
                      onClick={() => handleNavigate("upcoming")}
                      variant="outline"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Upcoming
                    </Button>
                  </div>
                </div>
                <Film className="absolute right-8 top-1/2 -translate-y-1/2 h-48 w-48 text-primary/10 rotate-12" />
              </div>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
            {view.type === "search" && totalResults > 0 && (
              <p className="text-muted-foreground">
                Found {totalResults.toLocaleString()} results
              </p>
            )}
          </div>

          {/* Category Tabs (only on home) */}
          {isHomeView && (
            <Tabs
              value={view.category}
              onValueChange={(value) =>
                handleNavigate(value as Category)
              }
              className="mb-8"
            >
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="popular">
                  <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="top-rated">
                  <Star className="h-4 w-4 mr-2 hidden sm:inline" />
                  Top Rated
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="now-playing">
                  <Play className="h-4 w-4 mr-2 hidden sm:inline" />
                  Now Playing
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Movies</h3>
              <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
              <Button onClick={fetchMovies}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Movie List */}
          {!error && (
            <>
              <MovieList
                movies={movies}
                isLoading={isLoading}
                onMovieClick={handleMovieClick}
                emptyMessage={
                  view.type === "search"
                    ? `No movies found for "${view.query}"`
                    : "No movies available"
                }
              />

              {/* Pagination */}
              {!isLoading && movies.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.min(totalPages, 500)}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t mt-20 py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p className="text-sm">
              Data provided by{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                TMDB
              </a>
            </p>
            <p className="text-xs mt-2">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
