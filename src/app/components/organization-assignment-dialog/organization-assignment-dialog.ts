import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelectModule, MatSelect, MatOption } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee, EmployeeOrganizationAssignment, EmployeeRole } from '../../interfaces/Employee';
import { Organization } from '../../interfaces/Organization';
import { EmployeesService } from '../../services/employees';
import { OrganizationsService } from '../../services/organizations';

export interface OrganizationAssignmentDialogData {
  employee: Employee;
  existingOrganizations: EmployeeOrganizationAssignment[];
}

@Component({
  selector: 'app-organization-assignment-dialog',
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Assign Organization</h2>
        <button
          mat-icon-button
          (click)="onCancel()"
          class="text-gray-400 hover:text-gray-600"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Employee Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ data.employee.name }}</h3>
        <p class="text-sm text-gray-600">{{ data.employee.email }}</p>
      </div>

      <form [formGroup]="assignmentForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Organization Selection -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Organization</mat-label>
          <mat-select formControlName="organizationId" panelClass="org-select-panel">
            @for (org of availableOrganizations(); track org.id) {
              <mat-option [value]="org.id">{{ org.name }}</mat-option>
            }
          </mat-select>
          <mat-error *ngIf="assignmentForm.get('organizationId')?.invalid && assignmentForm.get('organizationId')?.touched">
            Organization is required
          </mat-error>
        </mat-form-field>

        <!-- Role Selection -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="Admin">Admin</mat-option>
            <mat-option value="Editor">Editor</mat-option>
            <mat-option value="Viewer">Viewer</mat-option>
          </mat-select>
          <mat-error *ngIf="assignmentForm.get('role')?.invalid && assignmentForm.get('role')?.touched">
            Role is required
          </mat-error>
        </mat-form-field>

        @if (loading()) {
          <div class="text-center py-8 text-gray-500">
            <mat-progress-spinner 
              mode="indeterminate" 
              diameter="40"
              class="mx-auto mb-4">
            </mat-progress-spinner>
            <p>Loading organizations...</p>
          </div>
        } @else if (availableOrganizations().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl mb-2">business</mat-icon>
            <p>No available organizations to assign</p>
            <p class="text-sm mt-1">All organizations are already assigned to this employee</p>
          </div>
        }

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            (click)="onCancel()"
            mat-button
            class="text-gray-600"
          >
            Cancel
          </button>
<button
  type="submit"
  [disabled]="assignmentForm.invalid || availableOrganizations().length === 0"
  mat-raised-button
  class="!bg-[#800000] !text-white hover:!bg-[#660000] disabled:opacity-50 disabled:cursor-not-allowed shadow-md rounded-md"
>
  Assign Organization
</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
    ::ng-deep .mat-mdc-select-panel.org-select-panel {
      max-height: 208px !important;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    MatProgressSpinnerModule
]
})
export class OrganizationAssignmentDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<OrganizationAssignmentDialogComponent>);
  private formBuilder = inject(FormBuilder);
  private employeesService = inject(EmployeesService);
  private organizationsService = inject(OrganizationsService);
  private snackBar = inject(MatSnackBar);

  data: OrganizationAssignmentDialogData = inject(MAT_DIALOG_DATA);
  
  allOrganizations = signal<Organization[]>([]);
  availableOrganizations = signal<Organization[]>([]);
  
  assignmentForm!: FormGroup;

  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.assignmentForm = this.formBuilder.group({
      organizationId: ['', Validators.required],
      role: ['Editor', Validators.required]
    });

    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loading.set(true);
    this.organizationsService.getOrganizationsPaginated({
      page: 1,
      pageSize: 100,
      sortBy: 'name',
      sortOrder: 'asc',
      search: ''
    }).subscribe({
      next: (response) => {
        this.allOrganizations.set(response.data);
        this.filterAvailableOrganizations();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.showNotification('Failed to load organizations', true);
        this.loading.set(false);
      }
    });
  }

  filterAvailableOrganizations(): void {
    const existingOrgIds = this.data.existingOrganizations.map(org => org.orgId);
    const available = this.allOrganizations().filter(org => !existingOrgIds.includes(org.id));
    this.availableOrganizations.set(available);
  }

  onSubmit(): void {
    if (this.assignmentForm.valid && this.data.employee.id) {
      const formValue = this.assignmentForm.value;
      
      const assignment = {
        loginOrEmail: this.data.employee.login || this.data.employee.email,
        role: formValue.role as EmployeeRole
      };

      this.employeesService.assignToOrganization(formValue.organizationId, assignment).subscribe({
        next: () => {
          this.showNotification('Employee assigned to organization successfully');
          this.dialogRef.close({
            action: 'assign',
            data: assignment
          });
        },
        error: (error) => {
          console.error('Error assigning organization:', error);
          this.showNotification('Failed to assign employee to organization', true);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  private showNotification(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      panelClass: [isError ? 'snackbar-error' : 'snackbar-success']
    });
  }
}
