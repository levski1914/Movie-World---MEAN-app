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

  createMovie(movie: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.apiURL, movie, { headers });
  }

  updateMovie(id: string, movie: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.apiURL}/${id}`, movie, { headers });
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
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiURL}/favourites`,
      { movieId },
      { headers }
    );
  }

  getFavouriteMovies(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiURL}/favourites`, { headers });
  }

  removeFavourite(movieId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiURL}/favourites/${movieId}`, {
      headers,
    });
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
    const url = 'http://localhost:5000/api/proxy/trending'; // Прокси маршрут
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
    return this.http.get<any[]>(`${this.apiURL}/genre/${genre}`);
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
}
