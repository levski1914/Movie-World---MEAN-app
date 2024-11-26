import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiURL = 'http://localhost:5000/auth';

  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.isLoggedInFromStorage()
  );
  private usernameSubject = new BehaviorSubject<string | null>(
    this.getUsernameFromStorage()
  );

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  username$ = this.usernameSubject.asObservable();
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private isLoggedInFromStorage(): boolean {
    if (!this.isLocalStorageAvailable()) return false;
    return !!localStorage.getItem('authToken');
  }

  private getUsernameFromStorage(): string | null {
    if (!this.isLocalStorageAvailable()) return null;
    return localStorage.getItem('username');
  }

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiURL}/login`, credentials).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  register(user: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiURL}/register`, user).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }
  saveToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem('authToken', token);
      this.isLoggedInSubject.next(true);
    }
  }

  // Запазване на потребителско име
  saveUsername(username: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem('username', username);
      this.usernameSubject.next(username);
    }
  }

  // Премахване на данни при логоут
  logout(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      this.isLoggedInSubject.next(false);
    }
  }

  isLoggedIn(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    return !!localStorage.getItem('authToken');
  }
  // Извличане на потребителско име
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Извличане на токен
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
