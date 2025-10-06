import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Organization, OrganizationResponse, PaginationParams, CreateOrganizationDto, UpdateOrganizationDto, OrganizationUser } from '../interfaces/Organization';
import { Employee } from '../interfaces/Employee';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private apiUrl = 'http://localhost:8000/organizations';

  constructor(private http: HttpClient) {}

  // CRUD 
  createOrganization(organization: CreateOrganizationDto): Observable<Organization> {
    return this.http.post<Organization>('/grafana/createOrg', {
      ...organization,
      totalMembers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  updateOrganization(id: number, organization: UpdateOrganizationDto): Observable<Organization> {
    return this.http.put<Organization>(`/grafana/update/org/${id}`, {
      ...organization,
      updatedAt: new Date().toISOString()
    });
  }

  deleteOrganization(id: number): Observable<void> {
    return this.http.delete<void>(`/grafana/deleteOrg/${id}`);
  }

  getOrganization(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  getOrganizationUsers(orgId: number): Observable<OrganizationUser[]> {
    return this.http.get<OrganizationUser[]>(`/grafana/org/${orgId}/users`);
  }

  getOrganizationMemberCount(orgId: number): Observable<number> {
    return this.getOrganizationUsers(orgId).pipe(
      map(users => users.length)
    );
  }

  updateOrganizationWithMemberCount(org: Organization): Observable<Organization> {
    return this.getOrganizationMemberCount(org.id).pipe(
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
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.pageSize !== undefined) {
        httpParams = httpParams.set('limit', params.pageSize.toString());
      }
    }

    // sorting
    if (params.sortBy && params.sortBy !== 'totalMembers') {
      httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) {
        httpParams = httpParams.set('order', params.sortOrder);
      }
    }

    // search 
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<{ orgs: Organization[]; totalCount: number }>('/grafana/orgs', { 
      params: httpParams
    }).pipe(
      map(response => {
        const organizations = response.orgs;
        const total = response.totalCount;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const totalPages = Math.ceil(total / pageSize);
        
        const organizationsWithCounts$ = organizations.map(org => 
          this.getOrganizationMemberCount(org.id).pipe(
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



