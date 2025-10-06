import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DialogData } from '../../interfaces/Dialog';
import { Employee, EmployeeRole } from '../../interfaces/Employee';
import { Organization } from '../../interfaces/Organization';
import { OrganizationsService } from '../../services/organizations';

import { Role } from '../../interfaces/Role';
import { CommonModule} from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule, MatLabel, MatError } from '@angular/material/form-field';
import { MatInputModule, MatFormField } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-employee-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">{{ data.title }}</h2>
      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="space-y-4">

  <!-- Name -->
  <mat-form-field appearance="fill" class="w-full">
    <mat-label>Name</mat-label>
    <input matInput formControlName="name" placeholder="Enter name" />
    <mat-error *ngIf="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched">
      Name is required
    </mat-error>
  </mat-form-field>

  <!-- Email -->
  <mat-form-field appearance="fill" class="w-full">
    <mat-label>Email</mat-label>
    <input matInput type="email" formControlName="email" placeholder="Enter email" />
    <mat-error *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched">
      Valid email is required
    </mat-error>
  </mat-form-field>

  <!-- Login -->
  <mat-form-field appearance="fill" class="w-full">
    <mat-label>Login</mat-label>
    <input matInput formControlName="login" placeholder="Enter login username" />
    <mat-error *ngIf="employeeForm.get('login')?.invalid && employeeForm.get('login')?.touched">
      Login is required
    </mat-error>
  </mat-form-field>

  <!-- Password (only shown in add mode) -->
  @if (data.mode === 'add') {
    <mat-form-field appearance="fill" class="w-full">
      <mat-label>Password</mat-label>
      <input matInput type="password" formControlName="password" placeholder="Enter password" />
      <mat-error *ngIf="employeeForm.get('password')?.invalid && employeeForm.get('password')?.touched">
        Password is required
      </mat-error>
    </mat-form-field>
  }
  
  <div class="flex justify-end space-x-3 pt-4">
    <button
      type="button"
      (click)="onCancel()"
      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      [disabled]="employeeForm.invalid"
      class="px-4 py-2 text-sm font-medium text-white bg-red-900 border border-transparent rounded-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ data.mode === 'add' ? 'Add' : 'Update' }}
    </button>
  </div>

</form>

    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
    ::ng-deep .mdc-menu-surface.mat-mdc-select-panel {
      min-width: fit-content !important;
      max-width: none !important;
      width: 100% !important;
    }
    ::ng-deep .mat-mdc-select-panel.org-select-panel {
      max-height: 208px !important;
    }
    ::ng-deep .mat-mdc-select-panel.custom-role-panel {
      max-height: 144px !important;
      display: flex !important;
      flex-direction: column !important;
    }
    ::ng-deep .mat-mdc-option {
      min-height: 48px !important;
    }
    ::ng-deep .custom-role-panel .roles-container {
      overflow-y: auto;
      max-height: 96px !important;
    }
    ::ng-deep .custom-role-panel .add-role-section {
      padding: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      background: white;
      margin-top: auto;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatOptionModule,
    MatError,
    MatLabel,
    MatFormField
  ]
})
export class EmployeeDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EmployeeDialogComponent>);
  private formBuilder = inject(FormBuilder);
  private organizationsService = inject(OrganizationsService);

  data: DialogData<Employee> = inject(MAT_DIALOG_DATA);
  
  organizations = signal<Organization[]>([]);
  
  employeeForm!: FormGroup;

  ngOnInit(): void {
    // Create form group 
    this.employeeForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      login: ['', Validators.required]
    });

    if (this.data.mode === 'add') {
      this.employeeForm.addControl('password', this.formBuilder.control('', Validators.required));
    }

    // organizations
    this.organizationsService.getOrganizationsPaginated({
      page: 1,
      pageSize: 100, 
      sortBy: 'name',
      sortOrder: 'asc',
      search: ''
    }).subscribe({
      next: (response) => {
        this.organizations.set(response.data);
      }
    });

    if (this.data.mode === 'edit' && this.data.data) {
      console.log('Edit Data:', this.data.data);
      const formData = {
        name: this.data.data.name,
        email: this.data.data.email,
        login: this.data.data.login || this.data.data.name,
        role: this.data.data.role,
        OrgId: this.data.data.OrgId
      };
      console.log('Form Data:', formData);
      this.employeeForm.patchValue(formData);
    }
  }



  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.dialogRef.close({
        action: 'save',
        data: this.employeeForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}