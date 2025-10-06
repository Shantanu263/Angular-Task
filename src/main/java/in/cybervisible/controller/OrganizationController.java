package in.cybervisible.controller;
import in.cybervisible.service.impl.OrganizationServiceImpl;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/grafana")
public class OrganizationController {

    private final OrganizationServiceImpl service;

    public OrganizationController(OrganizationServiceImpl service) {
        this.service = service;
        log.info("Initializing GrafanaControllerUser with GrafanaService");
    }


    @GetMapping("/getallOrgs")
    public ResponseEntity<Object> listAllOrgs() {
        log.info("Fetching list of all organizations");
        Object response = service.listAllOrgs();
        if (response instanceof String) {
            String responseStr = (String) response;
            log.debug("Organizations list retrieved. Count: {}", responseStr.split("id").length - 1);
        } else {
            log.debug("Organizations list retrieved. Response type: {}", response != null ? response.getClass().getSimpleName() : "null");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orgs")
    public ResponseEntity<Object> listAllOrgsPaginated(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int perpage,
            @RequestParam(value = "sortBy", defaultValue = "name",required = false) String field,
            @RequestParam(value = "order", defaultValue = "asc", required = false) String sortBy,
            @RequestParam(value = "search", required = false) String query) {

        log.info("Fetching list of all organizations");

        Object response = service.listAllOrgs(page, perpage, field, sortBy, query);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/org/{orgId}/users")
    public ResponseEntity<Object> listUsersByOrg(@PathVariable String orgId) {
        log.info("Fetching users for organization ID: {}", orgId);
        return service.listUsersByOrg(orgId);
    }


    @GetMapping("/org/{id}")
    public ResponseEntity<Object> getOrgById(@PathVariable(name = "id") String orgid) {
        log.info("Fetching organization with ID: {}", orgid);
        return service.getOrgById(orgid);
    }


    @PostMapping("/createOrg")
    public ResponseEntity<Object> createOrganization(@RequestBody String body) {
        log.info("Received request to create organization. Payload: {}", body);
        return service.createOrganization(body);
    }

    @PutMapping("/update/org/{orgId}")
    public ResponseEntity<Object> updateOrganization(
            @PathVariable Integer orgId,
            @RequestBody String body) {

        log.info("Received update request for orgId {} with body {}", orgId, body);
        return service.updateOrganization(orgId, body);
    }


    @DeleteMapping("/deleteOrg/{orgId}")
    public ResponseEntity<Object> deleteOrg(@PathVariable String orgId) {
        log.warn("Deleting organization with ID: {}", orgId);
        return service.deleteOrg(orgId);
    }
}
