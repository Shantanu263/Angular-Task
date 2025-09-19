package com.shantanu.angular_project_backend.services;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

public interface EmployeeService {
    static Pageable getPageable(int pageNumber, int pageSize, String sortBy, String order) {
        Pageable pageable;
        if (order.equals("asc")) pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).ascending());
        else pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        return pageable;
    }

    ResponseEntity<?> getEmployees(int pageNumber, int pageSize, String sortBy, String order);

}
