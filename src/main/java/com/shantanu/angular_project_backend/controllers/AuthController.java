package com.shantanu.angular_project_backend.controllers;

import com.shantanu.angular_project_backend.DTOs.UserDTO;
import com.shantanu.angular_project_backend.repositories.UserRepo;
import com.shantanu.angular_project_backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepo userRepo;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        if (userRepo.existsByUsername(userDTO.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        authService.registerUser(userDTO);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        return authService.login(userDTO);
    }


    @PostMapping("/refresh-token")
    public  ResponseEntity<?> refresh(@RequestBody Map<String,String> refreshToken){
        return authService.refresh(refreshToken);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        authService.logout();
        return ResponseEntity.ok("Logged out successfully");
    }

}
