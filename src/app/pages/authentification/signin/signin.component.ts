import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router for navigation
import { AuthService } from 'app/services/auth';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  user = { email: '', password: '' };
  errorMessage: string = ''; // Store error messages
step: any;

  constructor(private authService: AuthService, private router: Router) {}

  // Form submission method for login
  login(form: NgForm) {
    if (form.valid) {
      this.authService.login(this.user).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          localStorage.setItem('authToken', response.token); // Save JWT token
         /*  this.router.navigate(['/dashboard']); // Redirect to dashboard after login */
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = err.error.message || 'Login failed. Please try again.';
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
