package com.shantanu.angular_project_backend.services;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface OrganizationService {
    static Pageable getPageable(int pageNumber, int pageSize, String sortBy, String order) {
        return EmployeeService.getPageable(pageNumber, pageSize, sortBy, order);
    }

    ResponseEntity<?> getOrganizations(int pageNumber, int pageSize, String sortBy, String order);

}
