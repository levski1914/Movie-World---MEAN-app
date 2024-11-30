import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiURL = 'http://localhost:5000/movies';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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

  rateMovie(movieId: string, rating: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiURL}/${movieId}/rate`,
      { rating },
      { headers }
    );
  }
}
