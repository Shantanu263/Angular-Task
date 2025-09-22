import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Organization, OrganizationResponse, PaginationParams, CreateOrganizationDto, UpdateOrganizationDto } from '../interfaces/Organization';
import { Employee } from '../interfaces/Employee';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private apiUrl = 'http://localhost:3000/organizations';

  constructor(private http: HttpClient) {}

  // CRUD 
  createOrganization(organization: CreateOrganizationDto): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, {
      ...organization,
      totalMembers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  updateOrganization(id: number, organization: UpdateOrganizationDto): Observable<Organization> {
    return this.http.patch<Organization>(`${this.apiUrl}/${id}`, {
      ...organization,
      updatedAt: new Date().toISOString()
    });
  }

  deleteOrganization(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOrganization(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  getOrganizationMemberCount(organizationName: string): Observable<number> {
    return this.http.get<Employee[]>('http://localhost:3000/employees', {
      params: new HttpParams().set('organisation', organizationName)
    }).pipe(
      map(employees => employees.length)
    );
  }

  updateOrganizationWithMemberCount(org: Organization): Observable<Organization> {
    return this.getOrganizationMemberCount(org.name).pipe(
      map(count => ({
        ...org,
        totalMembers: count
      }))
    );
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  getOrganizationsPaginated(params: PaginationParams = {}): Observable<OrganizationResponse> {
    let httpParams = new HttpParams();

    // pagination 
    if (params.sortBy !== 'totalMembers') {
      if (params.page !== undefined) {
        httpParams = httpParams.set('_page', params.page.toString());
      }
      if (params.pageSize !== undefined) {
        httpParams = httpParams.set('_limit', params.pageSize.toString());
      }
    }

    // sorting
    if (params.sortBy && params.sortBy !== 'totalMembers') {
      httpParams = httpParams.set('_sort', params.sortBy);
      if (params.sortOrder) {
        httpParams = httpParams.set('_order', params.sortOrder);
      }
    }

    // search 
    if (params.search) {
      httpParams = httpParams.set('q', params.search);
    }

    return this.http.get<Organization[]>(this.apiUrl, { 
      params: httpParams,
      observe: 'response'
    }).pipe(
      map(response => {
        const organizations = response.body || [];
        const totalHeader = response.headers.get('X-Total-Count');
        const total = totalHeader ? parseInt(totalHeader, 10) : organizations.length;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const totalPages = Math.ceil(total / pageSize);
        
        const organizationsWithCounts$ = organizations.map(org => 
          this.getOrganizationMemberCount(org.name).pipe(
            map(count => ({
              ...org,
              totalMembers: count
            }))
          )
        );

        return forkJoin(organizationsWithCounts$).pipe(
          map(updatedOrgs => {
            
            if (params.sortBy === 'totalMembers') {
              const sortedOrgs = [...updatedOrgs].sort((a, b) => {
                return params.sortOrder === 'asc' 
                  ? a.totalMembers - b.totalMembers
                  : b.totalMembers - a.totalMembers;
              });

              // Apply pagination after sorting
              const startIndex = ((params.page || 1) - 1) * (params.pageSize || 10);
              const endIndex = startIndex + (params.pageSize || 10);
              const paginatedOrgs = sortedOrgs.slice(startIndex, endIndex);

              return {
                data: paginatedOrgs,
                total,
                page: params.page || 1,
                pageSize: params.pageSize || 10,
                totalPages
              };
            }

            return {
              data: updatedOrgs,
              total,
              page,
              pageSize,
              totalPages
            };
          })
        );
      }),
      switchMap(result => result)
    );
  }
}



