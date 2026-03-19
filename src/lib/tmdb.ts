import type {
  MovieDetails,
  MovieResponse,
  Credits,
  VideosResponse,
} from "@/types/movie";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.warn(
    "TMDB API key is not set. Please add VITE_TMDB_API_KEY to your .env file."
  );
}

// Helper to build URL with API key
const buildUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

export const getImageUrl = (
  path: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "original"
): string => {
  if (!path) return "https://via.placeholder.com/1280x720?text=No+Backdrop";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

class TMDBError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "TMDBError";
    this.statusCode = statusCode;
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new TMDBError(
      errorData.status_message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
};

export const getPopularMovies = async (
  page: number = 1
): Promise<MovieResponse> => {
  const response = await fetch(
    buildUrl("/movie/popular", { page: page.toString() })
  );
  return handleResponse<MovieResponse>(response);
};

export const getTopRatedMovies = async (
  page: number = 1
): Promise<MovieResponse> => {
  const response = await fetch(
    buildUrl("/movie/top_rated", { page: page.toString() })
  );
  return handleResponse<MovieResponse>(response);
};

export const getUpcomingMovies = async (
  page: number = 1
): Promise<MovieResponse> => {
  const response = await fetch(
    buildUrl("/movie/upcoming", { page: page.toString() })
  );
  return handleResponse<MovieResponse>(response);
};

export const getNowPlayingMovies = async (
  page: number = 1
): Promise<MovieResponse> => {
  const response = await fetch(
    buildUrl("/movie/now_playing", { page: page.toString() })
  );
  return handleResponse<MovieResponse>(response);
};

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<MovieResponse> => {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  const response = await fetch(
    buildUrl("/search/movie", { 
      query: query.trim(),
      page: page.toString() 
    })
  );
  return handleResponse<MovieResponse>(response);
};

export const getMovieDetails = async (
  movieId: number
): Promise<MovieDetails> => {
  const response = await fetch(
    buildUrl(`/movie/${movieId}`)
  );
  return handleResponse<MovieDetails>(response);
};

export const getMovieCredits = async (movieId: number): Promise<Credits> => {
  const response = await fetch(
    buildUrl(`/movie/${movieId}/credits`)
  );
  return handleResponse<Credits>(response);
};

export const getMovieVideos = async (
  movieId: number
): Promise<VideosResponse> => {
  const response = await fetch(
    buildUrl(`/movie/${movieId}/videos`)
  );
  return handleResponse<VideosResponse>(response);
};

export const getSimilarMovies = async (
  movieId: number,
  page: number = 1
): Promise<MovieResponse> => {
  const response = await fetch(
    buildUrl(`/movie/${movieId}/similar`, { page: page.toString() })
  );
  return handleResponse<MovieResponse>(response);
};

export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1
): Promise<MovieResponse> => {
  const response = await fetch(
    buildUrl("/discover/movie", { 
      with_genres: genreId.toString(),
      page: page.toString() 
    })
  );
  return handleResponse<MovieResponse>(response);
};

export const getGenres = async (): Promise<{ genres: { id: number; name: string }[] }> => {
  const response = await fetch(
    buildUrl("/genre/movie/list")
  );
  return handleResponse<{ genres: { id: number; name: string }[] }>(response);
};

export { TMDBError };
