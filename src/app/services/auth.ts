import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
export interface User {
  id?: number;
  fullname?: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8081/petshop/api/auth/'; // Update this with your backend API

  constructor(private http: HttpClient, private router: Router) { }

  // 🔹 Register User
  register(user: User): Observable<any> {
    console.log(user);
    return this.http.post(`${this.apiUrl}/register`, user);
  }


  // Login method (Now with proper error handling)
  login(credentials: Pick<User, 'email' | 'password'>): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token && response.user) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));

          if (response.user.role === 'admin') {
            this.router.navigate(['/dashboard']); // Redirect Admins to Dashboard
          } /* else if (response.user.role === 'client') {
            this.router.navigate(['/client/home']); // Redirect Clients to Home
          } */
        }
      })
    );
  }
  // Get stored user data
  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    console.log(JSON.parse(user));
    return user ? JSON.parse(user) : null;
  }

  // Get user ID shortcut
  getUserId(): number | null {
    console.log(this.getCurrentUser()?.id)
    return this.getCurrentUser()?.id || null;
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
    localStorage.removeItem('authToken');// Remove JWT token
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth/signin']); // Redirect to login page

  }

  sendResetCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-reset-code`, { email });
  }

  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-reset-code`, { email, code });
  }

  resetPassword(email: string, verificationCode: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      email: email,
      verificationCode: verificationCode,
      password: newPassword  // Note: using 'password' to match backend
    });
  }

}
