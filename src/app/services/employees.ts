import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee, EmployeeResponse, PaginationParams, CreateEmployeeDto, UpdateEmployeeDto } from '../interfaces/Employee';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private apiUrl = 'http://localhost:3000/employees';

  constructor(private http: HttpClient) {}

  // CRUD 
  createEmployee(employee: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, {
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  updateEmployee(id: number, employee: UpdateEmployeeDto): Observable<Employee> {
    return this.http.patch<Employee>(`${this.apiUrl}/${id}`, {
      ...employee,
      updatedAt: new Date().toISOString()
    });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
      httpParams = httpParams.set('_page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('_limit', params.pageSize.toString());
    }

    // sorting 
    if (params.sortBy) {
      httpParams = httpParams.set('_sort', params.sortBy);
      if (params.sortOrder) {
        httpParams = httpParams.set('_order', params.sortOrder);
      }
    }

    // search 
    if (params.search) {
      httpParams = httpParams.set('q', params.search);
    }

    return this.http.get<Employee[]>(this.apiUrl, { 
      params: httpParams,
      observe: 'response'
    }).pipe(
      map(response => {
        const employees = response.body || [];
        const totalHeader = response.headers.get('X-Total-Count');
        const total = totalHeader ? parseInt(totalHeader, 10) : employees.length;
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
}


