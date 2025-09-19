package com.shantanu.angular_project_backend.controllers;

import com.shantanu.angular_project_backend.services.OrganizationService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/organization")
@CrossOrigin(origins = "http://localhost:4200")
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<?> getOrganizations(
            @RequestParam(value = "pageNumber", defaultValue = "0", required = false) int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "order", defaultValue = "asc", required = false) String order
    ){
        return organizationService.getOrganizations(pageNumber, pageSize, sortBy, order);
    }


}
