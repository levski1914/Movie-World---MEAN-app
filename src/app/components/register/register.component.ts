import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { response } from 'express';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid && this.passwordsMatch()) {
      const { username, email, password } = this.registerForm.value;

      this.authService.register({ username, email, password }).subscribe(
        (response) => {
          console.log('Registration successful!', response);

          this.authService.login({ email, password }).subscribe(
            (loginResponse) => {
              console.log('Auto-login successful!', loginResponse);
              this.authService.saveToken(loginResponse.token);
              this.authService.saveUsername(username);
              this.router.navigate(['/home']);
            },
            (loginError) => {
              console.error('Auto-login failed', loginError);
            }
          );
        },
        (error) => {
          console.error('Registration failed', error);
          alert('Registration failed!');
        }
      );
    } else {
      alert('Please, check inputs!');
    }
  }

  passwordsMatch(): boolean {
    return (
      this.registerForm.value.password ===
      this.registerForm.value.confirmPassword
    );
  }
}
