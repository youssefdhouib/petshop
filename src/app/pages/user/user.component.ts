import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth';
import { User, UsersService } from 'app/services/users';


@Component({
  selector: 'user-cmp',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: User = { fullname: '', email: '', phone: '', password: '', role: '' };
  isEditing = false;
  userId = this.authService.getUserId();

  constructor(private usersService: UsersService , private authService: AuthService) {}

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this.usersService.getUserById(this.userId).subscribe((data) => {
      this.user = data;
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  updateProfile() {
    this.usersService.updateUser(this.userId, this.user).subscribe(() => {
      alert('Profile updated successfully!');
      this.isEditing = false;
      this.getUserProfile();
    });
  }
}
