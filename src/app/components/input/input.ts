import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from '../form-error/form-error';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorComponent],
  template: `
    <div class="py-1">
      <span class="mb-0 text-md">{{ label() }}</span>
      <div class="relative">
        <input
          [type]="type() === 'password' ? (isPasswordVisible ? 'text' : 'password') : type()"
          [placeholder]="placeholder()"
          [formControl]="control()"
          class="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
          [class.pr-10]="type() === 'password'"
          [class.border-red-500]="control().touched && control().invalid"
        />
        @if (type() === 'password') {
          <button type="button" (click)="togglePasswordVisibility()" class="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none">
            <span class="sr-only">Toggle password visibility</span>
            @if (!isPasswordVisible) {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .638C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.324 16.173 7.26 19.178 11.9 19.178c1.61 0 3.141-.333 4.5-.933M6.228 6.228A10.45 10.45 0 0111.9 4.822c4.64 0 8.576 3.006 9.966 7.178a10.523 10.523 0 01-4.023 5.137M3 3l18 18"/>
              </svg>
            }
          </button>
        }
      </div>
      <app-form-error
        [errors]="control().errors"
        [field]="label()"
        [showError]="control().touched && control().invalid"
      />
    </div>
  `
})
export class InputComponent {
  label = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  control = input.required<FormControl>();
  isPasswordVisible = false;

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}