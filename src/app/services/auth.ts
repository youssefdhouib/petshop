import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
export interface User {
  fullname?: string;
  email: string;
  phone?: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/petshop/api/auth/'; // Update this with your backend API

  constructor(private http: HttpClient,private router: Router) { }

  // 🔹 Register User
  register(user: User): Observable<any> {
    console.log(user);
    return this.http.post(`${this.apiUrl}/register`, user);
  }


  // Login method (Now with proper error handling)
  login(credentials: Pick<User, 'email' | 'password'>): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token); // Save JWT token
        }
      })
    );
  }
  // 🔹 Get Token from Local Storage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // 🔹 Check if User is Authenticated
  isLoggedIn(): boolean {
    return !!this.getToken(); // Returns true if token exists
  }

  // 🔹 Logout User (Remove Token)
  logout(): void {
    localStorage.removeItem('authToken'); // Remove JWT token
    this.router.navigate(['/auth/signin']); // Redirect to login page
  }
}
