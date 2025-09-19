export interface Organization {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  totalMembers: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationDto extends Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'totalMembers'> {}
export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

export interface OrganizationResponse {
  data: Organization[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}



