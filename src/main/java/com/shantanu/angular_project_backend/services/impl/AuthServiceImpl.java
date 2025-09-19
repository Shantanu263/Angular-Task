package com.shantanu.angular_project_backend.services.impl;

import com.shantanu.angular_project_backend.DTOs.UserDTO;
import com.shantanu.angular_project_backend.models.User;
import com.shantanu.angular_project_backend.repositories.UserRepo;
import com.shantanu.angular_project_backend.services.AuthService;
import com.shantanu.angular_project_backend.services.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder encoder;
    private final JWTService jwtService;

    @Value("${jwt.accessTokenTime}")
    private long accessTokenTime;

    @Value("${jwt.refreshTokenTime}")
    private long refreshTokenTime;


    @Override
    public void registerUser(UserDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(encoder.encode(userDTO.getPassword()));
        user.setEmail(userDTO.getEmail());
        userRepo.save(user);
    }

    @Override
    public ResponseEntity<?> login(UserDTO userDTO) {
        User user = userRepo.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!encoder.matches(userDTO.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUsername(), accessTokenTime);
        String refreshToken = jwtService.generateToken(user.getUsername(), refreshTokenTime);

        Map<String, String> tokens = Map.of("accessToken", token, "refreshToken", refreshToken);
        return ResponseEntity.ok(tokens);
    }

    @Override
    public User fetchUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    @Override
    public ResponseEntity<?> refresh(Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Refresh token not found");
        }

        String username = jwtService.extractUsername(refreshToken);
        User user = userRepo.findByUsername(username)
                .orElseThrow(()->new UsernameNotFoundException("User not found"));

        if (!jwtService.validateToken(refreshToken,user)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateToken(username, accessTokenTime); // generate new Access Token

        System.out.println("Refreshing Token .....");
        return ResponseEntity.ok(Map.of("accessToken",newAccessToken));
    }

    @Override
    public void logout() {}
}
