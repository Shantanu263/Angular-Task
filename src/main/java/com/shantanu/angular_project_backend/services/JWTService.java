package com.shantanu.angular_project_backend.services;

import com.shantanu.angular_project_backend.models.User;
import io.jsonwebtoken.Claims;

import java.util.Date;
import java.util.function.Function;

public interface JWTService {
    String generateToken(String username, long time);

    String extractUsername(String token);

    <T> T extractClaim(String token, Function<Claims, T> claimResolver);

    Claims extractAllClaims(String token);

    boolean validateToken(String token, User user);

    boolean isTokenExpired(String token);

    Date extractExpiration(String token);
}
