import { Component } from '@angular/core';
import { NgForm } from '@angular/forms'; // Import NgForm for form validation

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  user = { email: '', password: '' };

  // Form submission method for login
  login(form: NgForm) {
    if (form.valid) {
      console.log('User login data:', this.user);
      // Call the service here to send data to the API for login
    } else {
      console.log('Form is invalid');
    }
  }
}
