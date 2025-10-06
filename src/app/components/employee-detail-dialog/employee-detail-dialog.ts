import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Employee, EmployeeOrganizationAssignment } from '../../interfaces/Employee';
import { EmployeesService } from '../../services/employees';
import { OrganizationAssignmentDialogComponent } from '../organization-assignment-dialog/organization-assignment-dialog';
import { NotificationService } from '../../services/notifications';

export interface EmployeeDetailDialogData {
  employee: Employee;
}

@Component({
  selector: 'app-employee-detail-dialog',
  template: `
    <div class="flex flex-col h-[600px] max-w-4xl">
      <!-- Header - Fixed -->
      <div class="flex items-center justify-between p-6 border-b bg-white">
        <h2 class="text-2xl font-semibold text-gray-900">Employee Details</h2>
        <button
          mat-icon-button
          (click)="onClose()"
          class="text-gray-400 hover:text-gray-600"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6">

      <!-- Employee Basic Info -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title class="text-xl">{{ data.employee.name }}</mat-card-title>
          <mat-card-subtitle>{{ data.employee.email }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
               <span class="font-medium text-gray-700">Login:</span> {{ data.employee.login }}
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Organizations Section -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Assigned Organizations</h3>
<button
  mat-raised-button
  (click)="openAssignmentDialog()"
  class="!bg-[#800000] !text-white hover:!bg-[#660000] flex items-center gap-1"
>
  <mat-icon>add</mat-icon>
  <span>Assign Organization</span>
</button>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (organizations().length > 0) {
          <div class="grid gap-4">
            @for (org of organizations(); track org.orgId) {
              <mat-card class="hover:shadow-md transition-shadow">
                <mat-card-content>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-6">
      <!-- Organization Name -->
      <h4 class="text-lg font-medium text-gray-900">{{ org.name }}</h4>

      <!-- Role Dropdown -->
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-700">Role:</span>
        <select
          class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]"
          [value]="org.role"
          (change)="updateRole(org, $any($event.target).value)"
        >
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>
    </div>

    <!-- Remove Button -->
    <button
      mat-icon-button
      color="warn"
      (click)="removeFromOrganization(org)"
      matTooltip="Remove from organization"
    >
      <mat-icon>remove_circle</mat-icon>
    </button>
  </div>
</mat-card-content>

              </mat-card>
            }
          </div>
        } @else {
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl mb-2">business</mat-icon>
            <p>No organization assignments found</p>
            <p class="text-sm mt-1">Click "Assign Organization" to add this employee to an organization</p>
          </div>
        }
      </div>

      </div>

      <!-- Footer - Fixed -->
      <div class="flex justify-end space-x-3 p-6 border-t bg-white">
        <button
          mat-button
          (click)="onClose()"
          class="text-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
    }
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .gap-4 {
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .md\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .overflow-y-auto {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e0 #f7fafc;
    }
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: #f7fafc;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class EmployeeDetailDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EmployeeDetailDialogComponent>);
  private employeesService = inject(EmployeesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);

  data: EmployeeDetailDialogData = inject(MAT_DIALOG_DATA);
  
  organizations = signal<EmployeeOrganizationAssignment[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    if (!this.data.employee.id) return;
    
    this.loading.set(true);
    this.employeesService.getUserOrganizations(this.data.employee.id).subscribe({
      next: (organizations) => {
        this.organizations.set(organizations || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.showNotification('Failed to load organization assignments', true);
        this.loading.set(false);
      }
    });
  }

  openAssignmentDialog(): void {
    const dialogRef = this.dialog.open(OrganizationAssignmentDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'responsive-dialog',
      data: {
        employee: this.data.employee,
        existingOrganizations: this.organizations()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'assign') {
        this.loadOrganizations(); // Refresh the list
        this.showNotification('Employee assigned to organization successfully');
      }
    });
  }

  removeFromOrganization(org: EmployeeOrganizationAssignment): void {
    if (!this.data.employee.id) return;

    if (confirm(`Are you sure you want to remove ${this.data.employee.name} from ${org.name}?`)) {
      this.employeesService.removeFromOrganization(this.data.employee.id, org.orgId).subscribe({
        next: () => {
          this.loadOrganizations(); // Refresh the list
          this.showNotification('Employee removed from organization successfully');
          this.notificationService.addActivity({
            entity: 'User',
            action: 'Deleted',
            title: `Removed from organization`,
            description: `${this.data.employee.name} was removed from ${org.name}`
          });
        },
        error: (error) => {
          console.error('Error removing from organization:', error);
          this.showNotification('Failed to remove employee from organization', true);
        }
      });
    }
  }

  updateRole(org: EmployeeOrganizationAssignment, newRole: string): void {
    if (!this.data.employee.id) return;
    
    this.employeesService.updateOrganizationRole(this.data.employee.id, org.orgId, newRole).subscribe({
      next: () => {
        this.loadOrganizations(); // Refresh the list
        this.showNotification(`Role updated to ${newRole} successfully`);
        this.notificationService.addActivity({
          entity: 'User',
          action: 'Role Updated',
          title: `Role updated in ${org.name}`,
          description: `${this.data.employee.name}'s role was updated to ${newRole}`
        });
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.showNotification('Failed to update role', true);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private showNotification(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      panelClass: [isError ? 'snackbar-error' : 'snackbar-success']
    });
  }
}
