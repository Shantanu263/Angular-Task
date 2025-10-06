package in.cybervisible.controller;

import in.cybervisible.dtos.UserUpdateDTO;
import in.cybervisible.service.impl.UserServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/grafana")
@Slf4j
public class UserController {

    private final UserServiceImpl service;

    public UserController(UserServiceImpl service) {
        this.service = service;
    }

    // ---------------- GET All User----------------
    @GetMapping("/getAllusers")
    public ResponseEntity<Object > getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    // ---------------- GET (All Users with Pagination) ----------------
    @GetMapping("/users")
    public ResponseEntity<Object> getAllUsers(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "5") int perpage,
            @RequestParam(value = "sortBy", defaultValue = "login", required = false) String field,
            @RequestParam(value = "order", defaultValue = "asc", required = false) String sortBy,
            @RequestParam(value = "search", required = false) String query) {

        return ResponseEntity.ok(
                service.getAllUsers(page, perpage, field, sortBy, query)
        );
    }

    // ---------------- GET (User by ID) ----------------
    @GetMapping("/getUserById/{userId}")
    public ResponseEntity<Object> getUserById(@PathVariable int userId) {
        log.info("Fetching user with ID: {}", userId);
        return service.getUserById(userId);
    }

    @GetMapping("/getUserByLoginOrEmail")
    public ResponseEntity<Object> getUser(@RequestParam String loginOrEmail) {
        log.info("Fetching user by loginOrEmail: {}", loginOrEmail);
        return service.getUserByLoginOrEmail(loginOrEmail);
    }

    // ---------------- Get User Organization Data  ----------------
    @GetMapping("/getUserOrgData/{userId}")
    public ResponseEntity<Object> getUserOrgData(@PathVariable int userId) {
        log.info("Fetching organization data for userId: {}", userId);
        return service.getUserOrgData(userId);
    }


    // ---------------- POST ----------------
    @PostMapping("/AddNewUsers")
    public ResponseEntity<Object> addUser(@RequestBody String body) {
        log.info("Adding new user with body: {}", body);
        return service.addUser(body);
    }

    // ---------------- POST (Enable User) ----------------
    @PostMapping("/enableUser/{userId}")
    public ResponseEntity<Object> enableUser(@PathVariable int userId) {
        log.info("Enabling user with ID: {}", userId);
        return service.enableUser(userId);
    }
    // ---------------- POST (Disable User) ----------------
    @PostMapping("/disableUser/{userId}")
    public ResponseEntity<Object> disableUser(@PathVariable int userId) {
        log.info("Disabling user with ID: {}", userId);
        return service.disableUser(userId);
    }





    // ---------------- PUT ----------------
    @PutMapping("/UpdateUsers/{userId}")
    public ResponseEntity<Object> editUser(@PathVariable("userId") int userId, @RequestBody String body) {
        log.info("Updating user with ID: {}", userId);
        return service.editUser(userId, body);
    }


    // ---------------- POST (assign user to org By Id) ----------------
    @PostMapping("/assignToOrg/{orgId}")
    public ResponseEntity<Object> assignOrgToUser(@PathVariable int orgId, @RequestBody String body) {
        // Body must include loginOrEmail + role
        return ResponseEntity.ok(service.assignOrgToUser(orgId, body));
    }

    // ---------------- PATCH (assign role) ----------------
    @PatchMapping("/org/{orgId}/users/{userId}/role")
    public ResponseEntity<Object> updateRole(
            @PathVariable int orgId,
            @PathVariable int userId,
            @RequestBody String body) {
        log.info("Updating role for orgId {}, userId {}", orgId, userId);
        return service.updateRole(orgId, userId, body);
    }


    // ---------------- DELETE USER FROM ORGANIZATION ----------------
    @DeleteMapping("/DeleteUsersByOrg/{orgId}/user/{userId}")
    public ResponseEntity<Object> deleteUserByOrg(@PathVariable int orgId, @PathVariable int userId) {
        log.info("Removing userId {} from orgId {}", userId, orgId);
        return service.deleteUserByOrg(orgId, userId);
    }


    // ---------------- DELETE ----------------
    @DeleteMapping("/DeleteUsers/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable int id) {
        log.info("Deleting user with ID: {}", id);
        return service.deleteUser(id);
    }

}
