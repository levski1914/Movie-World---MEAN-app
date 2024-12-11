import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isLoggedInFromStorage(): boolean {
    if (!this.isLocalStorageAvailable()) return false;
    return !!localStorage.getItem('authToken');
  }

  private getUsernameFromStorage(): string | null {
    if (!this.isLocalStorageAvailable()) return null;
    return localStorage.getItem('username');
  }

  private isLocalStorageAvailable(): boolean {
    try {
      if (!isPlatformBrowser(this.platformId)) {
        return false;
      }
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  initializeAuthState(): void {
    if (this.isLocalStorageAvailable()) {
      const authToken = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');

      this.isLoggedInSubject.next(!!authToken);
      this.usernameSubject.next(username);
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      localStorage.removeItem('userId');
      localStorage.removeItem('guestId');
      localStorage.removeItem('username');

      if (!localStorage.getItem('guestId')) {
        const guestId = 'guest-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guestId', guestId);
      }
    }
  }
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiURL}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.isLoggedInSubject.next(true);
          this.usernameSubject.next(response.username);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(
          () => new Error(error.error?.message || 'Login failed')
        );
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
        return throwError(
          () => new Error(error.error?.message || 'Registration failed')
        );
      })
    );
  }

  saveToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem('authToken', token);
      console.log('Token saved:', token);
      this.isLoggedInSubject.next(true);
    }
  }

  getToken(): string | null {
    const token = this.isLocalStorageAvailable()
      ? localStorage.getItem('authToken')
      : null;

    return token;
  }
  saveUsername(username: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem('username', username);
      this.usernameSubject.next(username);
    }
  }

  logout(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
      this.isLoggedInSubject.next(false);
      this.usernameSubject.next(null);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsername(): string | null {
    return this.usernameSubject.value;
  }

  getUserProfile(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    return this.http
      .get(`${this.apiURL}/profile`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching profile:', error);
          return throwError(
            () => new Error(error.error?.message || 'Failed to fetch profile')
          );
        })
      );
  }
}
