import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DialogData } from '../../interfaces/Dialog';
import { Employee, EmployeeRole } from '../../interfaces/Employee';
import { Organization } from '../../interfaces/Organization';
import { OrganizationsService } from '../../services/organizations';
import { RolesService } from '../../services/roles';
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

  <!-- Username -->
  <mat-form-field appearance="fill" class="w-full">
    <mat-label>Username</mat-label>
    <input matInput formControlName="username" placeholder="Enter username" />
    <mat-error *ngIf="employeeForm.get('username')?.invalid && employeeForm.get('username')?.touched">
      Username is required
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

  <!-- Organization -->
  <mat-form-field appearance="fill" class="w-full">
    <mat-label>Organization</mat-label>
    <mat-select formControlName="organisation" panelClass="org-select-panel">
      @for (org of organizations(); track org.id) {
        <mat-option [value]="org.name">{{ org.name }}</mat-option>
      }
    </mat-select>
    <mat-error *ngIf="employeeForm.get('organisation')?.invalid && employeeForm.get('organisation')?.touched">
      Organization is required
    </mat-error>
  </mat-form-field>

  <!-- Role -->
  <mat-form-field appearance="fill" class="w-full">
    <mat-label>Role</mat-label>
    <mat-select formControlName="role" panelClass="custom-role-panel">
      <div class="roles-container">
        @for (role of roles(); track role.id) {
          <mat-option [value]="role.name">{{ role.name }}</mat-option>
        }
      </div>
      <div class="add-role-section">
        <div class="flex gap-2">
          <input
            #newRoleInput
            type="text"
            [ngModel]="newRole()"
            (ngModelChange)="newRole.set($event)"
            [ngModelOptions]="{standalone: true}"
            placeholder="Add new role"
            class="flex-1 px-2 py-1 border rounded text-sm"
          />
          <button
            type="button"
            (click)="addNewRole()"
            class="px-3 py-1 text-sm bg-red-900 text-white rounded hover:bg-black"
          >
            Add
          </button>
        </div>
      </div>
    </mat-select>
    <mat-error *ngIf="employeeForm.get('role')?.invalid && employeeForm.get('role')?.touched">
      Role is required
    </mat-error>
  </mat-form-field>

  
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
    MatSelect,
    MatOption,
    MatFormField
]
})
export class EmployeeDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EmployeeDialogComponent>);
  private formBuilder = inject(FormBuilder);
  private organizationsService = inject(OrganizationsService);
  private rolesService = inject(RolesService);
  data: DialogData<Employee> = inject(MAT_DIALOG_DATA);
  
  organizations = signal<Organization[]>([]);
  roles = signal<Role[]>([]);
  newRole = signal<string>('');
  
  employeeForm: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    organisation: ['', Validators.required],
    role: ['user', Validators.required]
  });

  ngOnInit(): void {
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

    //roles
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
      }
    });

    if (this.data.mode === 'edit' && this.data.data) {
      this.employeeForm.patchValue(this.data.data);
    }
  }
  
  addNewRole(): void {
    if (this.newRole()) {
      const roleExists = this.roles().some(role => role.name === this.newRole());
      if (!roleExists) {
        this.rolesService.createRole({
          name: this.newRole(),
          description: `Custom role: ${this.newRole()}`
        }).subscribe({
          next: (newRole) => {
            this.roles.update(roles => [...roles, newRole]);
            this.newRole.set('');
          }
        });
      }
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