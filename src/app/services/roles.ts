import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role, RoleResponse, PaginationParams, CreateRoleDto, UpdateRoleDto } from '../interfaces/Role';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private apiUrl = 'http://localhost:3000/roles';

  constructor(private http: HttpClient) {}

  createRole(role: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: number, role: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRolesPaginated(params: PaginationParams = {}): Observable<RoleResponse> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) {
      httpParams = httpParams.set('_page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('_limit', params.pageSize.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('_sort', params.sortBy);
      if (params.sortOrder) {
        httpParams = httpParams.set('_order', params.sortOrder);
      }
    }
    if (params.search) {
      httpParams = httpParams.set('q', params.search);
    }

    return this.http.get<Role[]>(this.apiUrl, { 
      params: httpParams,
      observe: 'response'
    }).pipe(
      map(response => {
        const roles = response.body || [];
        const totalHeader = response.headers.get('X-Total-Count');
        const total = totalHeader ? parseInt(totalHeader, 10) : roles.length;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const totalPages = Math.ceil(total / pageSize);
        
        return {
          data: roles,
          total,
          page,
          pageSize,
          totalPages
        };
      })
    );
  }
}