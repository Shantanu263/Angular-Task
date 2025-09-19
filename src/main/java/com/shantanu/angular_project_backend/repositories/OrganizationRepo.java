package com.shantanu.angular_project_backend.repositories;

import com.shantanu.angular_project_backend.models.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepo extends JpaRepository<Organization, Long> {

}
