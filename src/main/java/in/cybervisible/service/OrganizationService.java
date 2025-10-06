package in.cybervisible.service;

import org.springframework.http.ResponseEntity;

public interface OrganizationService {
    // ----------------- Organization -----------------
    Object listAllOrgs();

    Object listAllOrgs(int page, int perpage, String field, String sortBy, String query);

    ResponseEntity<Object> listUsersByOrg(String orgId);

    ResponseEntity<Object> getOrgById(String orgId);

    ResponseEntity<Object> createOrganization(String body);

    ResponseEntity<Object> updateOrganization(Integer orgId, String body);

    ResponseEntity<Object> deleteOrg(String orgId);
}
