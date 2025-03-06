import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Router } from '@angular/router'; // Import Router for navigation
import { AuthService } from 'app/services/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  user = { fullname: '', email: '', phone: '', password: '' };
  errorMessage: string = ''; // To store error messages

  constructor(private authService: AuthService, private router: Router) {}

  // Form submission method
  register(form: NgForm) {
    if (form.valid) {
      this.authService.register(this.user).subscribe({
        next: (response) => {
          console.log('User registered:', response);
          this.router.navigate(['/auth/signin']); // Redirect to sign-in page after successful registration
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.errorMessage = err.error.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
