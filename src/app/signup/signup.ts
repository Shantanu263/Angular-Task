import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputComponent, FooterComponent } from '../components';
import { AuthService } from '../services/auth';
import { UserSignup } from '../interfaces/UserSignup';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, InputComponent, FooterComponent, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent {
  protected readonly authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);


  protected readonly title = 'Create an Account';

  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };

  signupForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]),
    confirmPassword: new FormControl('', [
      Validators.required, 
    ])
  }, { validators: this.passwordMatchValidator });

  onSubmit() {
    if (this.signupForm.valid) {
      //console.log('Form submitted:', this.signupForm.value);
      const formValue = { username : this.signupForm.value.username, email : this.signupForm.value.email,password : this.signupForm.value.password } 
      this.authService.saveUser(formValue as UserSignup).subscribe((data:string) => {
        console.log(data);
      });

      this.snackBar.open('User Registed Successfully!', 'Dismiss', {
        duration: 5000,
        panelClass: ['snackbar-success']
      });
      this.signupForm.reset();
    } else {
      this.signupForm.markAllAsTouched();
      this.snackBar.open('User Registration Failed!', 'Dismiss', {
        duration: 5000,
        panelClass: ['snackbar-error']
      });
    }
  }
}
