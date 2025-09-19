import { Component, inject, signal } from '@angular/core';
import { InputComponent, FooterComponent } from '../components';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputComponent, FooterComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  protected readonly title = signal('Welcome back');
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ])
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email as string;
      const password = this.loginForm.value.password as string;
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/home']);
          this.snackBar.open('Login Successful !', 'Dismiss', {
            duration: 5000
          });
        },
        error: () => {
          // stay on page; optionally show error UI
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
