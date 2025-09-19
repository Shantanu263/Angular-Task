package com.shantanu.angular_project_backend.services.impl;

import com.shantanu.angular_project_backend.DTOs.OrganizationResponsePageDTO;
import com.shantanu.angular_project_backend.models.Organization;
import com.shantanu.angular_project_backend.repositories.OrganizationRepo;
import com.shantanu.angular_project_backend.services.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class OrganizationServiceImpl implements OrganizationService {
    private final OrganizationRepo organizationRepo;

    @Override
    public ResponseEntity<?> getOrganizations(int pageNumber, int pageSize, String sortBy, String order) {
        Pageable pageable = OrganizationService.getPageable(pageNumber, pageSize, sortBy, order);
        Page<Organization> page =  organizationRepo.findAll(pageable);
        return ResponseEntity.ok(new OrganizationResponsePageDTO(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast()));
    }
}
