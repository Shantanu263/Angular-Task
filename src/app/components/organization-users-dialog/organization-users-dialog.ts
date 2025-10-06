import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Organization, OrganizationUser } from '../../interfaces/Organization';
import { OrganizationsService } from '../../services/organizations';

export interface OrganizationUsersDialogData {
  organization: Organization;
}

@Component({
  selector: 'app-organization-users-dialog',
  template: `
    <div class="flex flex-col h-[600px] max-w-4xl min-w-[800px]">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b bg-white">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-1">{{ data.organization.name }}</h2>
          <p class="text-sm text-gray-500">Organization Members</p>
        </div>
        <button
          mat-icon-button
          (click)="onClose()"
          class="text-gray-400 hover:text-gray-600"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        @if (loading()) {
          <div class="flex justify-center items-center h-full">
            <mat-progress-spinner
              mode="indeterminate"
              diameter="40">
            </mat-progress-spinner>
          </div>
        } @else if (users().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl mb-2">group</mat-icon>
            <p>No users found in this organization</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="users()" class="w-full">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef class="!text-left"> Name </th>
                <td mat-cell *matCellDef="let user">
                  <div class="font-medium">{{ user.name }}</div>
                </td>
              </ng-container>

              <!-- Login Column -->
              <ng-container matColumnDef="login">
                <th mat-header-cell *matHeaderCellDef class="!text-left"> Login </th>
                <td mat-cell *matCellDef="let user"> {{ user.login }} </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef class="!text-left"> Email </th>
                <td mat-cell *matCellDef="let user"> {{ user.email }} </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef class="!text-left"> Role </th>
                <td mat-cell *matCellDef="let user">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                    [ngClass]="{
                      'bg-red-100 text-red-800': user.role === 'Admin',
                      'bg-blue-100 text-blue-800': user.role === 'Editor',
                      'bg-green-100 text-green-800': user.role === 'Viewer'
                    }">
                    {{ user.role }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex justify-end p-6 border-t bg-white">
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
    .mat-mdc-table {
      background: transparent;
    }
    .mat-mdc-header-row {
      background: #f9fafb;
    }
    .mat-mdc-header-cell {
      color: #4b5563;
      font-weight: 600;
      white-space: nowrap;
    }
    .mat-mdc-row:hover {
      background: #f9fafb;
    }
    .mat-mdc-cell {
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ]
})
export class OrganizationUsersDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<OrganizationUsersDialogComponent>);
  private organizationsService = inject(OrganizationsService);

  data: OrganizationUsersDialogData = inject(MAT_DIALOG_DATA);

  displayedColumns = ['name', 'login', 'email', 'role'];
  users = signal<OrganizationUser[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (!this.data.organization.id) return;

    this.loading.set(true);
    this.organizationsService.getOrganizationUsers(this.data.organization.id).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  isUserActive(lastSeenAge: string): boolean {
    // Consider a user active if they were seen in the last hour
    return lastSeenAge.includes('minute') || lastSeenAge.includes('second');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}