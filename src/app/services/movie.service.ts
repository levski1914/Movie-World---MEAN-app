import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiURL = 'http://localhost:5000/movies';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found for headers');
    } else {
      console.log('Token for headers:', token);
    }
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }
  getMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  getMoviesById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${id}`);
  }
  getMoviesByTMDbId(tmdbId: string): Observable<any> {
    const url = `${this.apiURL}?tmdbId=${tmdbId}`;
    return this.http.get<any>(url).pipe(
      tap((response) => {
        if (!response) {
          console.error(`No movie found for TMDb ID: ${tmdbId}`);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching movie by TMDb ID: ${tmdbId}`, error);
        return throwError(() => new Error('Failed to fetch movie by TMDb ID'));
      })
    );
  }

  createMovie(movie: any): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('Headers for createMovie:', headers.get('Authorization'));
    return this.http.post<any>(this.apiURL, movie, { headers });
  }
  updateMovie(movieId: string, updatedMovie: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiURL}/${movieId}`, updatedMovie, {
      headers,
    });
  }

  deleteMovie(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiURL}/${id}`, { headers });
  }

  getMyMovies(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiURL}/my-movies`, { headers });
  }

  addFavourite(movieId: string): Observable<any> {
    if (!movieId) {
      console.error('Movie ID is required for adding to favourites');
      return throwError(() => new Error('Movie ID is required'));
    }

    const headers = this.getAuthHeaders();
    const body = { movieId };

    console.log('Sending request to add favourite:', body);

    return this.http
      .post<any>(`${this.apiURL}/favourites`, body, { headers })
      .pipe(
        tap((response) => console.log('Add favourite response:', response)),
        catchError((error) => {
          console.error('Error adding favourite:', error);
          return throwError(() => error);
        })
      );
  }

  searchMoviesFromTMDb(query: string): Observable<any[]> {
    if (!query.trim()) {
      return new Observable((observer) => observer.next([]));
    }

    const url = `http://localhost:5000/api/proxy/search?query=${query}`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching search results:', error);
        return throwError(() => error);
      })
    );
  }
  removeFavourite(movieId: string): Observable<any> {
    if (!movieId) {
      console.error('Movie ID is required for removing from favourites');
      return throwError(() => new Error('Movie ID is required'));
    }

    const headers = this.getAuthHeaders();

    console.log('Sending request to remove favourite for movie:', movieId);

    return this.http
      .delete<any>(`${this.apiURL}/favourites/${movieId}`, { headers })
      .pipe(
        tap((response) => console.log('Remove favourite response:', response)),
        catchError((error) => {
          console.error('Error removing favourite:', error);
          return throwError(() => error);
        })
      );
  }
  getFavouriteMovies(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiURL}/favourites`, { headers });
  }

  getMovieRatings(movieId: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${movieId}/ratings`);
  }

  rateMovie(
    movieId: string,
    rating: number,
    userId: string | null,
    guestId: string | null
  ): Observable<any> {
    if (!movieId) {
      console.error('Movie ID is required for rating.');
      return throwError(() => new Error('Movie ID is required.'));
    }

    const headers = this.getAuthHeaders();
    const body = {
      rating,
      userId: userId || localStorage.getItem('userId'),
      guestId,
    };

    return this.http.post<any>(`${this.apiURL}/${movieId}/rate`, body, {
      headers,
    });
  }
  getUserId(): string {
    return this.authService.getUsername() || '';
  }
  getTrendingMovies(): Observable<any> {
    const url = 'http://localhost:5000/api/proxy/trending';
    return this.http.get<any>(url).pipe(
      tap((data: any) => {
        if (!data || !data.results) {
          console.error('Invalid response from TMDb API:', data);
        }
      }),
      catchError((error: any) => {
        console.error('Error fetching trending movies:', error);
        return throwError(() => new Error('Failed to fetch trending movies'));
      })
    );
  }
  getMoviesByGenre(genre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}?genre=${genre}`).pipe(
      catchError((error) => {
        console.error('Error fetching movies by genre:', error);
        return throwError(() => new Error('Failed to fetch movies by genre'));
      })
    );
  }
  getTMDbMovieDetails(tmdbId: string): Observable<any> {
    const url = `http://localhost:5000/api/proxy/movie/${tmdbId}`;
    return this.http.get<any>(url).pipe(
      catchError((error: any) => {
        console.error('Error fetching TMDb movie details:', error);
        return throwError(
          () => new Error('Failed to fetch movie details from TMDb')
        );
      })
    );
  }
  getGenres(): Observable<{ genres: Array<{ id: number; name: string }> }> {
    const url = 'http://localhost:5000/api/proxy/genres';
    return this.http.get<{ genres: Array<{ id: number; name: string }> }>(url);
  }

  getAllGenres(): Observable<any> {
    const url = 'http://localhost:5000/api/proxy/genres';
    return this.http.get<any>(url).pipe(
      catchError((error: any) => {
        console.error('Error fetching genres:', error);
        return throwError(() => new Error('Failed to fetch genres'));
      })
    );
  }
}
