export type EmployeeRole = 'Admin' | 'Editor' | 'Viewer';

export interface Employee {
  id?: number;
  name: string;
  email: string;
  organisation: string;
  OrgId: number;  // Added for form mapping
  login: string;  // Added login field
  role: EmployeeRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto extends Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface EmployeeResponse {
  data: Employee[];
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

export interface EmployeeOrganizationAssignment {
  orgId: number;
  name: string;
  role: EmployeeRole;
}

export interface UserOrganizationData {
  userId: number;
  organizations: EmployeeOrganizationAssignment[];
}

export interface AssignOrganizationDto {
  loginOrEmail: string;
  role: EmployeeRole;
}




