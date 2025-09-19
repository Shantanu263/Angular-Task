export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface CreateRoleDto extends Omit<Role, 'id'> {}
export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

export interface RoleResponse {
  data: Role[];
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