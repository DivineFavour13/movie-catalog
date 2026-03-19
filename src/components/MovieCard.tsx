import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: number) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const handleClick = () => {
    onClick?.(movie.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-0 shadow-md"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-black/70 text-white backdrop-blur-sm border-0"
          >
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{formatRating(movie.vote_average)}</span>
          </Badge>
        </div>

        {/* Hover Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <p className="text-sm text-white/90 line-clamp-3">{movie.overview}</p>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-base line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(movie.release_date)}</span>
        </div>
      </CardContent>
    </Card>
  );
}