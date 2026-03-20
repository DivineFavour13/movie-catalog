import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Globe,
  Film,
  Users,
  TrendingUp,
  PlayCircle,
} from "lucide-react";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getImageUrl,
  getBackdropUrl,
  getSimilarMovies,
} from "@/lib/tmdb";
import type { MovieDetails, Credits, Movie, Video } from "@/types/movie";
import { MovieList } from "./MovieList";

interface MovieDetailProps {
  movieId: number;
  onBack?: () => void;
  onMovieClick?: (movieId: number) => void;
}

export function MovieDetail({ movieId, onBack, onMovieClick }: MovieDetailProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [movieData, creditsData, videosData, similarData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getMovieVideos(movieId),
          getSimilarMovies(movieId),
        ]);
        setMovie(movieData);
        setCredits(creditsData);
        const preferredTrailer =
          videosData.results.find(
            (video) =>
              video.site === "YouTube" &&
              video.type === "Trailer" &&
              video.official
          ) ||
          videosData.results.find(
            (video) => video.site === "YouTube" && video.type === "Trailer"
          ) ||
          videosData.results.find((video) => video.site === "YouTube");
        setTrailer(preferredTrailer ?? null);
        setSimilarMovies(similarData.results.slice(0, 6));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movie details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo(0, 0);
  }, [movieId]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="relative h-[50vh] md:h-[60vh]">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 -mt-32 relative z-10">
            <Skeleton className="w-full md:w-[300px] aspect-[2/3] rounded-xl shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Film className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load movie</h2>
        <p className="text-muted-foreground mb-4">{error || "Movie not found"}</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const director = credits?.crew.find((person) => person.job === "Director");
  const mainCast = credits?.cast.slice(0, 6) || [];
  const trailerUrl = trailer
    ? `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`
    : null;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 -mt-32 relative z-10">
          {/* Poster */}
          <div className="w-full md:w-[300px] shrink-0">
            <img
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              className="w-full aspect-[2/3] rounded-xl shadow-2xl object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  "{movie.tagline}"
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                </Badge>

                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(movie.release_date)}
                </Badge>

                {movie.runtime > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}

                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {movie.original_language.toUpperCase()}
                </Badge>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="default">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Trailer */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                <PlayCircle className="h-5 w-5 text-primary" />
                Trailer
              </h2>
              {trailerUrl ? (
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <div className="aspect-video w-full">
                    <iframe
                      src={trailerUrl}
                      title={`${movie.title} trailer`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <PlayCircle className="h-10 w-10 text-muted-foreground/50" />
                    <div>
                      <p className="font-medium">Trailer not available</p>
                      <p className="text-sm text-muted-foreground">
                        TMDB does not have a playable trailer for this movie yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {director && (
                <div>
                  <p className="text-sm text-muted-foreground">Director</p>
                  <p className="font-medium">{director.name}</p>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{formatCurrency(movie.budget)}</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="font-medium">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{movie.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {mainCast.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mainCast.map((actor) => (
                <Card
                  key={actor.id}
                  className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={getImageUrl(actor.profile_path, "w342")}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm line-clamp-1">
                      {actor.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {actor.character}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Similar Movies
            </h2>
            <MovieList
              movies={similarMovies}
              onMovieClick={onMovieClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
