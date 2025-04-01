import { Component, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.scss']
})
export class ForgetPasswordComponent implements OnDestroy {
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  step: number = 1; // Track current step in the process
  countdown: number = 60; // Countdown timer for OTP expiration
  timer: any;
  codeExpired: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  // Step 1: Send reset code
  sendResetCode(form: NgForm) {
    if (form.valid) {
      this.authService.sendResetCode(this.email).subscribe({
        next: () => {
          this.step = 2; // Move to step 2
          this.startCountdown();
        },
        error: (err) => console.error('Error sending code:', err)
      });
    }
  }

  // Step 2: Verify the code
  verifyCode(form: NgForm) {
    if (form.valid) {
      this.authService.verifyResetCode(this.email, this.verificationCode).subscribe({
        next: () => this.step = 3, // Move to step 3
        error: (err) => console.error('Verification failed:', err)
      });
    }
  }

  // Step 3: Reset password
  resetPassword(form: NgForm) {
    if (form.valid && this.passwordsMatch) {
      this.authService.resetPassword(
        this.email,
        this.verificationCode,  // Make sure you have this in your component
        this.newPassword
      ).subscribe({
        next: () => {
          alert('Password successfully reset!');
          this.router.navigate(['/auth/signin']);
        },
        error: (err) => {
          alert('Failed to reset password: ' + (err.error?.message || err.message));
          console.error('Error:', err);
        }
      });
    }
  }

  // Start countdown timer for OTP expiration
  startCountdown() {
    this.clearCountdown(); // Ensure no duplicate timers
    this.codeExpired = false;
    this.countdown = 60; // Reset countdown

    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.codeExpired = true; // Mark code as expired
      }
    }, 1000);
  }

  // Resend verification code
  resendCode() {
    this.authService.sendResetCode(this.email).subscribe({
      next: () => {
        this.startCountdown(); // Restart countdown
        this.codeExpired = false; // Reset expiration flag
      },
      error: (err) => console.error('Error resending code:', err)
    });
  }

  // Clear countdown timer
  clearCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Check if passwords match
  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword;
  }

  // Cleanup on component destroy
  ngOnDestroy() {
    this.clearCountdown();
  }
}
