export type EmployeeRole = 'admin' | 'user' | 'manager';

export interface Employee {
  id?: number;
  username: string;
  email: string;
  organisation: string;
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




