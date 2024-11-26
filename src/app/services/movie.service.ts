import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiURL = 'http://localhost:5000/movies';

  constructor(private http: HttpClient) {}

  getMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  getMoviesById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${id}`);
  }

  createMovie(movie: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Baerer ${token}`);
    return this.http.post<any>(this.apiURL, movie, { headers });
  }

  updateMovie(id: string, movie: any): Observable<any> {
    return this.http.put<any>(`${this.apiURL}/${id}`, movie);
  }

  deleteMovie(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/${id}`);
  }
}
