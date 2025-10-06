import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee, EmployeeResponse, PaginationParams, CreateEmployeeDto, UpdateEmployeeDto, UserOrganizationData, AssignOrganizationDto, EmployeeOrganizationAssignment } from '../interfaces/Employee';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private apiUrl = 'http://localhost:8000/employees';

  constructor(private http: HttpClient) {}

  // CRUD 
  createEmployee(employee: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>('/grafana/AddNewUsers', {
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  updateEmployee(id: number, employee: { name: string; email: string; login: string }): Observable<Employee> {
    return this.http.put<Employee>(`/grafana/UpdateUsers/${id}`, employee);
  }

  updateEmployeeRole(userId: number, orgId: number, role: string): Observable<Employee> {
    return this.http.patch<Employee>(`/grafana/org/${orgId}/users/${userId}/role`, { role });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`/grafana/DeleteUsers/${id}`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeesPaginated(params: PaginationParams = {}): Observable<EmployeeResponse> {
    let httpParams = new HttpParams();

    // pagination 
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('limit', params.pageSize.toString());
    }

    // sorting 
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) {
        httpParams = httpParams.set('order', params.sortOrder);
      }
    }

    // search 
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<{ totalCount: number; users: Employee[] }>('/grafana/users', { 
      params: httpParams
    }).pipe(
      map(response => {
        const employees = response.users;
        const total = response.totalCount;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const totalPages = Math.ceil(total / pageSize);
        
        return {
          data: employees,
          total,
          page,
          pageSize,
          totalPages
        };
      })
    );
  }

  // Get user's organization assignments
  getUserOrganizations(userId: number): Observable<EmployeeOrganizationAssignment[]> {
    return this.http.get<EmployeeOrganizationAssignment[]>(`/grafana/getUserOrgData/${userId}`);
  }

  // Assign user to organization with role
  assignToOrganization(orgId: number, assignment: AssignOrganizationDto): Observable<any> {
    return this.http.post(`/grafana/assignToOrg/${orgId}`, assignment);
  }

  // Remove user from organization
  removeFromOrganization(userId: number, orgId: number): Observable<void> {
    return this.http.delete<void>(`/grafana/DeleteUsersByOrg/${orgId}/user/${userId}`);
  }

  // Update user role in organization
  updateOrganizationRole(userId: number, orgId: number, role: string): Observable<void> {
    return this.http.patch<void>(`/grafana/org/${orgId}/users/${userId}/role`, { role });
  }
}


