import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gray-100 py-4 w-full text-center mt-auto">
      <p class="text-gray-600">© 2025 My Company. All rights reserved.</p>
    </footer>
  `,
})
export class FooterComponent {}