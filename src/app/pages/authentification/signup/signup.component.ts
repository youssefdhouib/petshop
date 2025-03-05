import { Component } from '@angular/core';
import { NgForm } from '@angular/forms'; // Import NgForm for form validation

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  user = { fullname: '', email: '', phone: '', password: '' };

  // Form submission method
  register(form: NgForm) {
    if (form.valid) {
      console.log('User registration data:', this.user);
      // Call the service here to send data to the API
    } else {
      console.log('Form is invalid');
    }
  }
}
