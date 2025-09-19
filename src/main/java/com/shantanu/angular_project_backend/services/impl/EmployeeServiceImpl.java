package com.shantanu.angular_project_backend.services.impl;

import com.shantanu.angular_project_backend.DTOs.EmployeeResponsePageDTO;
import com.shantanu.angular_project_backend.models.Employee;
import com.shantanu.angular_project_backend.repositories.EmployeeRepo;
import com.shantanu.angular_project_backend.services.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepo employeeRepo;

    @Override
    public ResponseEntity<?> getEmployees(int pageNumber, int pageSize, String sortBy, String order) {
        Pageable pageable = EmployeeService.getPageable(pageNumber, pageSize, sortBy, order);
        Page<Employee> page =  employeeRepo.findAll(pageable);
        return ResponseEntity.ok(new EmployeeResponsePageDTO(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast()));
    }



}
