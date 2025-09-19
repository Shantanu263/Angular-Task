import { Component, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  template: `
    <div class="h-8 overflow-hidden">
      @if (errors() && showError()) {
        <p class="text-red-500 text-xs leading-4 whitespace-normal break-words">
          @if (errors()!['required']) {
            {{ field() }} is required
          } @else if (errors()!['email']) {
            Please enter a valid email address
          } @else if (errors()!['minlength']) {
            {{ field() }} must be at least {{ errors()!['minlength'].requiredLength }} characters
          } @else if (errors()!['pattern']) {
            Password needs a number, uppercase letter and symbol
            <br />
            (!,@,/)
          } @else if (errors()!['ValidatorFn']) {
            Passwords do not match
          }
        </p>
      }
    </div>
  `
})
export class FormErrorComponent {
  errors = input<ValidationErrors | null>(null);
  field = input<string>('This field');
  showError = input<boolean>(false);
}