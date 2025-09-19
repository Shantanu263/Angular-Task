package com.shantanu.angular_project_backend.controllers;

import com.shantanu.angular_project_backend.services.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/employee")
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping("/home")
    public ResponseEntity<?> hello(){
        return ResponseEntity.ok("Hello");
    }

    @GetMapping
    public ResponseEntity<?> getEmployees(
            @RequestParam(value = "pageNumber", defaultValue = "0", required = false) int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "order", defaultValue = "asc", required = false) String order
    ){
        return employeeService.getEmployees(pageNumber,pageSize,sortBy,order);
    }

}
