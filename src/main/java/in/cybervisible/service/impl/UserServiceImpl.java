package in.cybervisible.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.cybervisible.client.GrafanaApiClient;
import in.cybervisible.dtos.UserUpdateDTO;
import in.cybervisible.dtos.UserWithOrgDTO;
import in.cybervisible.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final GrafanaApiClient client;

    public UserServiceImpl(GrafanaApiClient client) {
        this.client = client;
    }

    // Show all users (Super Admin)
    @Override
    public Object  getAllUsers() {
        return client.get("/api/users/search");
    }

    // Get all users with pagination (Super Admin only)
    @Override
    public Map<String, Object> getAllUsers(int page, int perpage, String field, String sortBy, String query) {
        String path = "/api/users/search?perpage=" + perpage + "&page=" + page;
        if (query != null && !query.isEmpty()) {
            path += "&query=" + query;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) client.get(path);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> users = (List<Map<String, Object>>) response.get("users");

        List<UserWithOrgDTO> result = new ArrayList<>();

        if (users != null && !users.isEmpty()) {
            for (Map<String, Object> user : users) {
                Integer userId = (Integer) user.get("id");
                String name = (String) user.get("name");
                String login = (String) user.get("login");
                String email = (String) user.get("email");

                String organisation = null;
                String role = null;

                if (userId != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> orgs = (List<Map<String, Object>>) client.get("/api/users/" + userId + "/orgs");

                    if (orgs != null && !orgs.isEmpty()) {
                        Map<String, Object> firstOrg = orgs.get(0);
                        organisation = (String) firstOrg.get("name");
                        role = (String) firstOrg.get("role");
                    }
                }

                result.add(new UserWithOrgDTO(userId, name, login, email, organisation, role));
            }

            // Sorting
            Comparator<UserWithOrgDTO> comparator =
                    Comparator.comparing(u -> {
                        if ("email".equalsIgnoreCase(field)) return u.getEmail();
                        if ("login".equalsIgnoreCase(field)) return u.getLogin();
                        if ("organisation".equalsIgnoreCase(field)) return u.getOrganisation();
                        if ("role".equalsIgnoreCase(field)) return u.getRole();
                        return u.getName();
                    }, String.CASE_INSENSITIVE_ORDER);

            if ("desc".equalsIgnoreCase(sortBy)) {
                comparator = comparator.reversed();
            }

            result.sort(comparator);
        }

        Map<String, Object> finalResponse = new HashMap<>();
        finalResponse.put("totalCount", response.get("totalCount"));
        finalResponse.put("users", result);

        return finalResponse;
    }




    // ---------------- Service ----------------
    @Override
    public ResponseEntity<Object> getUserOrgData(int userId) {
        try {
            Object response = client.get("/api/users/" + userId + "/orgs");

            // If response is empty array → return 404 Not Found
            if (response instanceof List<?> list && list.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No organization data found for user", "userId", userId));
            }

            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana getUserOrgData API error for userId {}: {}", userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "userId", userId));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to fetch user organization data", "userId", userId,
                                "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error fetching org data for userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "userId", userId));
        }
    }

    // Add new user (Super Admin)
    @Override
    public ResponseEntity<Object> addUser(String body) {
        if (body == null || body.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Request body is required to add a user"));
        }

        try {
            Object response = client.post("/api/admin/users", body);
            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            String message = getErrorMessage(e);
            log.warn("Grafana AddNewUsers API error: {}", message);

            if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already exists"));
            } else if (status == 400) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid user data" + message));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to add user: " + message));
            }

        } catch (Exception e) {
            log.error("Unexpected error adding user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error"));
        }
    }

    private static String getErrorMessage(WebClientResponseException e) {
        String rawResponse = e.getResponseBodyAsString();
        String message = rawResponse;

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(rawResponse);
            if (node.has("message")) {
                message = node.get("message").asText();
            }
        } catch (Exception parseException) {
            message = rawResponse;
        }
        return message;
    }

    // Enable user (Super Admin)
    @Override
    public ResponseEntity<Object> enableUser(int userId) {
        try {
            Object response = client.post("/api/admin/users/" + userId + "/enable", "{}");
            return ResponseEntity.ok(Map.of("message", "User(id:"+userId+") enabled successfully", "userId", userId, "response", response));

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana enableUser API error for userId {}: {}", userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "userId", userId));
            } else if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already enabled", "userId", userId));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to enable user", "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error enabling userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "userId", userId));
        }
    }

    // Disable user (Super Admin)
    @Override
    public ResponseEntity<Object> disableUser(int userId) {
        try {
            Object response = client.post("/api/admin/users/" + userId + "/disable", "{}");
            return ResponseEntity.ok(Map.of("message", "User(id:"+userId+") disabled successfully", "userId", userId, "response", response));

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana disableUser API error for userId {}: {}", userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "userId", userId));
            } else if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already disabled", "userId", userId));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to disable user", "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error disabling userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "userId", userId));
        }
    }



    // Edit user details (Super Admin)
    @Override
    public ResponseEntity<Object> editUser(int userId, String body) {
        System.out.println(body);
        if (body == null|| body.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Request body is required to update the user"));
        }

        try {
            Object response = client.put("/api/users/" + userId, body);
            return ResponseEntity.ok(Map.of("message", "User(id:"+userId+") updated successfully", "userId", userId, "response", response));

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana editUser API error for userId {}: {}", userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "userId", userId));
            } else if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User name or email already taken", "userId", userId));
            } else if (status == 400) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid user data", "userId", userId, "details", e.getResponseBodyAsString()));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to update user", "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error updating userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "userId", userId));
        }
    }



    // Optional: fetch user by login/email
    @Override
    public ResponseEntity<Object> getUserByLoginOrEmail(String loginOrEmail) {
        if (loginOrEmail == null || loginOrEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "loginOrEmail parameter is required"));
        }

        // Convert to lower case for case-insensitive search
        String query = loginOrEmail.toLowerCase();

        try {
            Object response = client.get("/api/users/lookup?loginOrEmail=" + query);

            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana getUserByLoginOrEmail API error for '{}': {}", query, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "loginOrEmail", query));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of(
                                "message", "Failed to fetch user",
                                "loginOrEmail", query,
                                "details", e.getResponseBodyAsString()
                        ));
            }

        } catch (Exception e) {
            log.error("Unexpected error fetching user '{}': {}", query, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "loginOrEmail", query));
        }
    }

    // Get user details by ID (Super Admin only)
    @Override
    public ResponseEntity<Object> getUserById(int userId) {
        try {
            Object response = client.get("/api/users/" + userId);
            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana getUserById API error for userId {}: {}", userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "userId", userId));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to fetch user", "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error fetching userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "userId", userId));
        }
    }


    // Assign role to user in org (Org Admin or Super Admin)
    @Override
    public Object assignOrgToUser(int orgId, String body) {
        return client.post("/api/orgs/" + orgId + "/users", body);
    }

    // Assign role to Exsiting user in org.
    @Override
    public ResponseEntity<Object> updateRole(int orgId, int userId, String body) {
        if (body == null || body.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Request body is required to assign role"));
        }

        try {
            Object response = client.patch("/api/orgs/" + orgId + "/users/" + userId, body);
            return ResponseEntity.ok(Map.of(
                    "message", "User(id:" + userId + ") Role updated successfully for organization(id:" + orgId + ")",
                    "orgId", orgId,
                    "userId", userId,
                    "response", response
            ));

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana updateRole API error for orgId {}, userId {}: {}", orgId, userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization or User not found", "orgId", orgId, "userId", userId));
            } else if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Role already assigned or conflict", "orgId", orgId, "userId", userId));
            } else if (status == 400) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid request data", "orgId", orgId, "userId", userId, "details", e.getResponseBodyAsString()));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to update role", "orgId", orgId, "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error updating role for orgId {}, userId {}: {}", orgId, userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "orgId", orgId, "userId", userId));
        }
    }


    // Delete user globally (Super Admin)
    @Override
    public ResponseEntity<Object> deleteUserByOrg(int orgId, int userId) {
        try {
            Object response = client.delete("/api/orgs/" + orgId + "/users/" + userId);
            return ResponseEntity.ok(Map.of(
                    "message", "User(id:" + userId + ") removed from organization (id:" + orgId + ") successfully",
                    "orgId", orgId,
                    "userId", userId,
                    "response", response
            ));

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana deleteUserByOrg API error for orgId {}, userId {}: {}", orgId, userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization or user not found", "orgId", orgId, "userId", userId));
            } else if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already removed from organization", "orgId", orgId, "userId", userId));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to remove user from organization", "orgId", orgId, "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error removing userId {} from orgId {}: {}", userId, orgId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "orgId", orgId, "userId", userId));
        }
    }

    // Delete user globally (Super Admin)
    @Override
    public ResponseEntity<Object> deleteUser(int userId) {
        try {
            Object response = client.delete("/api/admin/users/" + userId);
            return ResponseEntity.ok(Map.of(
                    "message", "User with id " + userId + " deleted successfully" ,
                    "userId", userId,
                    "response", response
            ));

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana deleteUser API error for userId {}: {}", userId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found", "userId", userId));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to delete user", "userId", userId, "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error deleting userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "userId", userId));
        }
    }

}
