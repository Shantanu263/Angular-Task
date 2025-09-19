package com.shantanu.angular_project_backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@Table(name = "Organizations")
@NoArgsConstructor
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;
    int members;

    @OneToMany(mappedBy = "organization")
    @JsonIgnore
    List<Employee> employees;


}
