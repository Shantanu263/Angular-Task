package in.cybervisible.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.cybervisible.client.GrafanaApiClient;
import in.cybervisible.dtos.OrganizationDTO;
import in.cybervisible.service.OrganizationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
@Slf4j
public class OrganizationServiceImpl implements OrganizationService {

    private final GrafanaApiClient client;
    private final ObjectMapper objectMapper;

    public OrganizationServiceImpl(GrafanaApiClient client, ObjectMapper objectMapper) {
        this.client = client;
        this.objectMapper = objectMapper;
    }

    // ----------------- Organization -----------------
    @Override
    public Object listAllOrgs() {
        return client.get("/api/orgs");
    }

    @Override
    public Map<String, Object> listAllOrgs(int page, int perpage, String field, String sortBy, String query) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> orgs = (List<Map<String, Object>>) client.get("/api/orgs");

        List<OrganizationDTO> result = new ArrayList<>();

        if (orgs != null && !orgs.isEmpty()) {
            for (Map<String, Object> org : orgs) {
                Integer id = (Integer) org.get("id");
                String name = (String) org.get("name");

                // search filter
                if (query != null && !query.isEmpty() && !name.toLowerCase().contains(query.toLowerCase())) {
                    continue;
                }

                // fetch members of org
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> members = (List<Map<String, Object>>) client.get("/api/orgs/" + id + "/users");

                String createdBy = null;
                int totalMembers = 0;

                if (members != null) {
                    totalMembers = members.size();

                    // pick first Admin as "creator"
                    Optional<Map<String, Object>> admin = members.stream()
                            .filter(m -> "Admin".equalsIgnoreCase((String) m.get("role")))
                            .findFirst();

                    if (admin.isPresent()) {
                        createdBy = (String) admin.get().get("login"); // or "email" / "name"
                    }
                }

                result.add(new OrganizationDTO(id, name, createdBy, totalMembers));
            }

            // sorting
            Comparator<OrganizationDTO> comparator;
            switch (field.toLowerCase()) {
                case "id":
                    comparator = Comparator.comparing(OrganizationDTO::getId);
                    break;
                case "createdby":
                    comparator = Comparator.comparing(OrganizationDTO::getCreatedBy, String.CASE_INSENSITIVE_ORDER);
                    break;
                case "totalmembers":
                    comparator = Comparator.comparing(OrganizationDTO::getTotalMembers);
                    break;
                default:
                    comparator = Comparator.comparing(OrganizationDTO::getName, String.CASE_INSENSITIVE_ORDER);
            }

            if ("desc".equalsIgnoreCase(sortBy)) {
                comparator = comparator.reversed();
            }
            result.sort(comparator);

            // pagination
            int totalCount = result.size();
            int fromIndex = Math.min((page - 1) * perpage, totalCount);
            int toIndex = Math.min(fromIndex + perpage, totalCount);
            List<OrganizationDTO> paginated = result.subList(fromIndex, toIndex);

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", totalCount);
            response.put("orgs", paginated);
            return response;
        }

        Map<String, Object> emptyResponse = new HashMap<>();
        emptyResponse.put("totalCount", 0);
        emptyResponse.put("orgs", Collections.emptyList());
        return emptyResponse;
    }


    @Override
    public ResponseEntity<Object> listUsersByOrg(String orgId) {

        // Validate orgId
        if (orgId == null || orgId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Organization ID is required"));
        }

        try {
            Object response = client.get("/api/orgs/" + orgId + "/users");

            // Check if response is empty array
            if (response instanceof List<?> list && list.isEmpty()) {
                log.info("No users found for this organization: " + orgId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No users found for this organization"));
            }

            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode();
            log.warn("Grafana listUsersByOrg API error for orgId {}: {}", orgId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization not found"));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to fetch users", "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error fetching users for orgId {}: {}", orgId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error"));
        }
    }

    @Override
    public ResponseEntity<Object> getOrgById(String orgId) {

        // Validate ID
        if (orgId == null || orgId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Organization ID is required"));
        }

        try {
            Object response = client.get("/api/orgs/" + orgId);
            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            int status = e.getRawStatusCode(); // Spring 6 compatible
            log.warn("Grafana getOrgById API error for orgId {}: {}", orgId, e.getResponseBodyAsString());

            if (status == 404) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization not found"));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Failed to fetch organization", "details", e.getResponseBodyAsString()));
            }

        } catch (Exception e) {
            log.error("Unexpected error fetching orgId {}: {}", orgId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error"));
        }
    }


    @Override
    public ResponseEntity<Object> createOrganization(String body) {
        try {
            log.info("Calling Grafana API to create organization. Payload: {}", body);
            Object response = client.post("/api/orgs", body);
            log.info("Organization created successfully. Response: {}", response);
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            log.error("Grafana API returned error. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Unexpected error while creating organization", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Internal Server Error\"}");
        }
    }


    @Override
    public ResponseEntity<Object> updateOrganization(Integer orgId, String body) {

    // Check if ID is valid
    if (orgId == null || orgId <= 0) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid organization ID"));
    }

    // Check if body is empty
    if (body == null || body.trim().isEmpty()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Request body is required"));
    }

    try {
        // Call Grafana PUT API
        client.put("/api/orgs/" + orgId, body);
        return ResponseEntity.ok(Map.of("message","Organization(id:"+orgId+") updated"));

    } catch (WebClientResponseException e) {
        // Handle Grafana errors
        if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Organization not found"));
        } else if (e.getStatusCode() == HttpStatus.CONFLICT) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Organization name already taken"));
        } else {
            log.error("Grafana update API error for orgId {}: {}", orgId, e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", "Update failed", "details", e.getResponseBodyAsString()));
        }
    } catch (Exception e) {
        log.error("Unexpected error updating organization {}: {}", orgId, e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Internal server error"));
    }
}


@Override
public ResponseEntity<Object> deleteOrg(String orgId) {
        // Validate orgId
        if (orgId == null || orgId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Organization ID is required"));
        }

        try {
            Object response = client.delete("/api/orgs/" + orgId);
            return ResponseEntity.ok(Map.of("message", "Organization(id:"+orgId+") deleted successfully", "response", response));

        } catch (WebClientResponseException e) {
            HttpStatusCode status = e.getStatusCode();
            String msg = e.getResponseBodyAsString();
            log.warn("Grafana delete API error for orgId {}: {}", orgId, msg);

            if (status == HttpStatus.NOT_FOUND) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization not found"));
            } else if (status == HttpStatus.CONFLICT) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Cannot delete organization due to conflict"));
            } else {
                return ResponseEntity.status(status)
                        .body(Map.of("message", "Delete failed", "details", msg));
            }

        } catch (Exception e) {
            log.error("Unexpected error deleting orgId {}: {}", orgId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error"));
        }
    }
}



