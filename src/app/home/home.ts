import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EmployeesService } from '../services/employees';
import { Employee, PaginationParams, CreateEmployeeDto, UpdateEmployeeDto } from '../interfaces/Employee';
import { OrganizationsService } from '../services/organizations';
import { Organization, PaginationParams as OrgPaginationParams, CreateOrganizationDto, UpdateOrganizationDto } from '../interfaces/Organization';
import { EmployeeDialogComponent } from '../components/employee-dialog/employee-dialog';
import { OrganizationDialogComponent } from '../components/organization-dialog/organization-dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    // EmployeeDialogComponent,
    // OrganizationDialogComponent,
    // ConfirmDialogComponent,
    FormsModule
  ]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private employeesService = inject(EmployeesService);
  private organizationsService = inject(OrganizationsService);
  message:Observable<string> = of('');
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  employees = signal<Employee[] | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  organizations = signal<Organization[] | null>(null);
  orgLoading = signal<boolean>(false);
  orgError = signal<string | null>(null);
  showOrganizations = signal<boolean>(false);
  activeTab: 'employees' | 'organizations' = 'employees';


  // employee- Pagination, sorting state 
  empCurrentPage = signal<number>(1);
  empPageSize = signal<number>(5);
  empSortBy = signal<string>('username');
  empSortOrder = signal<'asc' | 'desc'>('asc');
  empSearch = signal<string>('');
  empTotalPages = signal<number>(0);
  empTotalItems = signal<number>(0);

  // organization- pagination, sorting state 
  orgCurrentPage = signal<number>(1);
  orgPageSize = signal<number>(5);
  orgSortBy = signal<string>('name');
  orgSortOrder = signal<'asc' | 'desc'>('asc');
  orgSearch = signal<string>('');
  orgTotalPages = signal<number>(0);
  orgTotalItems = signal<number>(0);

  // pagination info
  empPageNumbers = computed(() => Array.from({ length: this.empTotalPages() }, (_, i) => i + 1));
  
  empPaginationInfo = computed(() => ({
    currentPage: this.empCurrentPage(),
    pageSize: this.empPageSize(),
    totalPages: this.empTotalPages(),
    totalItems: this.empTotalItems(),
    startItem: (this.empCurrentPage() - 1) * this.empPageSize() + 1,
    endItem: Math.min(this.empCurrentPage() * this.empPageSize(), this.empTotalItems())
  }));

  orgPageNumbers = computed(() => Array.from({ length: this.orgTotalPages() }, (_, i) => i + 1));

  orgPaginationInfo = computed(() => ({
    currentPage: this.orgCurrentPage(),
    pageSize: this.orgPageSize(),
    totalPages: this.orgTotalPages(),
    totalItems: this.orgTotalItems(),
    startItem: (this.orgCurrentPage() - 1) * this.orgPageSize() + 1,
    endItem: Math.min(this.orgCurrentPage() * this.orgPageSize(), this.orgTotalItems())
  }));


  logout() {
    this.authService.logout().subscribe({
      next: () => {},
      error: () => {
        this.authService.clearTokens();
        this.router.navigate(['/login']);
      }
    });

  }

  showMessage() {
    this.authService.getMessage().subscribe((data:string) => {
      console.log(data);
      this.message = of(data);
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    const params: PaginationParams = {
      page: this.empCurrentPage(),
      pageSize: this.empPageSize(),
      sortBy: this.empSortBy(),
      sortOrder: this.empSortOrder(),
      search: this.empSearch()
    };

    this.employeesService.getEmployeesPaginated(params).subscribe({
      next: response => {
        this.employees.set(response.data);
        this.empTotalItems.set(response.total);
        this.empTotalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load employees');
        this.loading.set(false);
      }
    });
  }

  openOrganizations(): void {
    // Reset employee search state when switching to organizations
    this.empSearch.set('');
    this.empCurrentPage.set(1);
    this.empSortBy.set('username');
    this.empSortOrder.set('asc');
    
    this.showOrganizations.set(true);
    this.loadOrganizations();
    this.activeTab = 'organizations';
  }

  loadOrganizations(): void {
    this.orgLoading.set(true);
    const params: OrgPaginationParams = {
      page: this.orgCurrentPage(),
      pageSize: this.orgPageSize(),
      sortBy: this.orgSortBy(),
      sortOrder: this.orgSortOrder(),
      search: this.orgSearch()
    };

    this.organizationsService.getOrganizationsPaginated(params).subscribe({
      next: response => {
        this.organizations.set(response.data);
        this.orgTotalItems.set(response.total);
        this.orgTotalPages.set(response.totalPages);
        this.orgLoading.set(false);
      },
      error: () => {
        this.orgError.set('Failed to load organizations');
        this.orgLoading.set(false);
      }
    });
  }

  openEmployees(): void {
    // Reset organization search state when switching to employees
    this.orgSearch.set('');
    this.orgCurrentPage.set(1);
    this.orgSortBy.set('name');
    this.orgSortOrder.set('asc');
    
    this.showOrganizations.set(false);
    this.activeTab = 'employees';
    this.loadEmployees();
  }

  // Employee - pagination , sorting 
  onEmpPageChange(page: number): void {
    this.empCurrentPage.set(page);
    this.loadEmployees();
  }

  onEmpSort(field: string): void {
    if (this.empSortBy() === field) {
      this.empSortOrder.set(this.empSortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.empSortBy.set(field);
      this.empSortOrder.set('asc');
    }
    this.empCurrentPage.set(1);
    this.loadEmployees();
  }

  onEmpSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.empSearch.set(target.value);
      this.empCurrentPage.set(1);
      this.loadEmployees();
    }
  }

  onEmpPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const pageSize = +(target.value);
      if (pageSize) {
        this.empPageSize.set(pageSize);
        this.empCurrentPage.set(1);
        this.loadEmployees();
      }
    }
  }

  // Organization - pagination, sorting 
  onOrgPageChange(page: number): void {
    this.orgCurrentPage.set(page);
    this.loadOrganizations();
  }

  onOrgSort(field: string): void {
    if (this.orgSortBy() === field) {
      this.orgSortOrder.set(this.orgSortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.orgSortBy.set(field);
      this.orgSortOrder.set('asc');
    }
    this.orgCurrentPage.set(1);
    this.loadOrganizations();
  }

  onOrgSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.orgSearch.set(target.value);
      this.orgCurrentPage.set(1);
      this.loadOrganizations();
    }
  }

  onOrgPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const pageSize = +(target.value);
      if (pageSize) {
        this.orgPageSize.set(pageSize);
        this.orgCurrentPage.set(1);
        this.loadOrganizations();
      }
    }
  }

  // Employee CRUD operations
  addEmployee(): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '500px',
      data: {
        mode: 'add',
        title: 'Add Employee'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.loading.set(true);
        this.employeesService.createEmployee(result.data).subscribe({
          next: () => {
            this.showNotification('Employee added successfully');
            this.loadEmployees();
          },
          error: () => {
            this.showNotification('Failed to add employee', true);
            this.loading.set(false);
          }
        });
      }
    });
  }

  editEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        title: 'Edit Employee',
        data: employee
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'save' && employee.id) {
        this.loading.set(true);
        this.employeesService.updateEmployee(employee.id, result.data).subscribe({
          next: () => {
            this.showNotification('Employee updated successfully');
            this.loadEmployees();
          },
          error: () => {
            this.showNotification('Failed to update employee', true);
            this.loading.set(false);
          }
        });
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${employee.username}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && employee.id) {
        this.loading.set(true);
        this.employeesService.deleteEmployee(employee.id).subscribe({
          next: () => {
            this.showNotification('Employee deleted successfully');
            this.loadEmployees();
          },
          error: () => {
            this.showNotification('Failed to delete employee', true);
            this.loading.set(false);
          }
        });
      }
    });
  }

  // Organization CRUD operations
  addOrganization(): void {
    const dialogRef = this.dialog.open(OrganizationDialogComponent, {
      width: '500px',
      data: {
        mode: 'add',
        title: 'Add Organization'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.orgLoading.set(true);
        this.organizationsService.createOrganization(result.data).subscribe({
          next: () => {
            this.showNotification('Organization added successfully');
            this.loadOrganizations();
          },
          error: () => {
            this.showNotification('Failed to add organization', true);
            this.orgLoading.set(false);
          }
        });
      }
    });
  }

  editOrganization(organization: Organization): void {
    const dialogRef = this.dialog.open(OrganizationDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        title: 'Edit Organization',
        data: organization
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.orgLoading.set(true);
        this.organizationsService.updateOrganization(organization.id, result.data).subscribe({
          next: () => {
            this.showNotification('Organization updated successfully');
            this.loadOrganizations();
          },
          error: () => {
            this.showNotification('Failed to update organization', true);
            this.orgLoading.set(false);
          }
        });
      }
    });
  }

  deleteOrganization(organization: Organization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Organization',
        message: `Are you sure you want to delete ${organization.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.orgLoading.set(true);
        this.organizationsService.deleteOrganization(organization.id).subscribe({
          next: () => {
            this.showNotification('Organization deleted successfully');
            this.loadOrganizations();
          },
          error: () => {
            this.showNotification('Failed to delete organization', true);
            this.orgLoading.set(false);
          }
        });
      }
    });
  }

  get fillerRows(): number[] {
    const count = Math.max(this.empPageSize() - (this.employees()?.length || 0), 0);
    return Array.from({ length: count });
  }

  private showNotification(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      //verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [isError ? 'snackbar-error' : 'snackbar-success', 'fixed-under-navbar', 'snackbar-below-navbar']
    });
  }
}



