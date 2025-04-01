import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import { AuthentificationRoutingModule } from './authentification.routing';
 import { SigninComponent } from './signin/signin.component';
import { ForgetPasswordComponent } from './forgetpassword/forgetpassword.component';

@NgModule({
  declarations: [
    SignupComponent,
     SigninComponent,
     ForgetPasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AuthentificationRoutingModule
  ]
})
export class AuthentificationModule { }
