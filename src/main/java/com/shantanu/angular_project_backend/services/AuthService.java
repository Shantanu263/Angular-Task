package com.shantanu.angular_project_backend.services;

import com.shantanu.angular_project_backend.DTOs.UserDTO;
import com.shantanu.angular_project_backend.models.User;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
    void registerUser(UserDTO userDTO);

    User fetchUserDetails();

    ResponseEntity<?> login(UserDTO userDTO);

    ResponseEntity<?> refresh(Map<String, String> request);

    void logout();
}
