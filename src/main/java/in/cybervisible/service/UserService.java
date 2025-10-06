package in.cybervisible.service;

import in.cybervisible.dtos.UserUpdateDTO;
import org.springframework.http.ResponseEntity;

public interface UserService {
    // Show all users (Super Admin)
    Object  getAllUsers();

    // Get all users with pagination (Super Admin only)
    Object getAllUsers(int page, int perpage, String field, String sortBy, String query);


    // ---------------- Service ----------------
    ResponseEntity<Object> getUserOrgData(int userId);

    // Add new user (Super Admin)
    ResponseEntity<Object> addUser(String body);


    // Enable user (Super Admin)
    ResponseEntity<Object> enableUser(int userId);


    // Disable user (Super Admin)
    ResponseEntity<Object> disableUser(int userId);


    // Edit user details (Super Admin)
    ResponseEntity<Object> editUser(int userId, String body);

    // Optional: fetch user by login/email
    ResponseEntity<Object> getUserByLoginOrEmail(String loginOrEmail);

    // Get user details by ID (Super Admin only)
    ResponseEntity<Object> getUserById(int userId);

    // Assign role to user in org (Org Admin or Super Admin)
    Object assignOrgToUser(int orgId, String body);


    // Assign role to Exsiting user in org.
    ResponseEntity<Object> updateRole(int orgId, int userId, String body);


    // Delete user globally (Super Admin)
    ResponseEntity<Object> deleteUserByOrg(int orgId, int userId);


    ResponseEntity<Object> deleteUser(int userId);
}
