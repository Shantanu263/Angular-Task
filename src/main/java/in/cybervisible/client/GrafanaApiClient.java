package in.cybervisible.client;

import in.cybervisible.exception.GrafanaClientException;
import in.cybervisible.exception.OrganizationAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class GrafanaApiClient {
    private static final Logger log = LoggerFactory.getLogger(GrafanaApiClient.class);

    private final WebClient webClient;

    @Value("${grafana.base.url}")
    private String baseUrl;

    @Value("${grafana.admin.username}")
    private String username;

    @Value("${grafana.admin.password}")
    private String password;

    public GrafanaApiClient(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    private HttpHeaders buildBasicAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(username, password);
        return headers;
    }

    // ---------------- GET ----------------
    public Object  get(String path) {
        return webClient.get()
                .uri(baseUrl + path)
                .headers(h -> h.addAll(buildBasicAuthHeaders()))
                .retrieve()
                .bodyToMono(Object.class)
                .block();
    }

    // ---------------- POST ----------------
    public Object post(String path, String body) {
        return webClient.post()
                .uri(baseUrl + path)
                .headers(h -> {
                    h.addAll(buildBasicAuthHeaders());
                    h.setContentType(MediaType.APPLICATION_JSON);
                })
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class)
                .block();
    }

    public Object put(String path, String body) {
        return webClient.put()
                .uri(baseUrl + path)
                .headers(h -> {
                    h.addAll(buildBasicAuthHeaders());
                    h.setContentType(MediaType.APPLICATION_JSON);
                })
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class)
                .block();
    }


    // ---------------- PATCH ----------------
    public Object patch(String path, String body) {
        return webClient.patch()
                .uri(baseUrl + path)
                .headers(h -> {
                    h.addAll(buildBasicAuthHeaders());
                    h.setContentType(MediaType.APPLICATION_JSON);
                })
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class)
                .block();
    }


    // ---------------- DELETE ----------------
    public Object delete(String path) {
        return webClient.delete()
                .uri(baseUrl + path)
                .headers(h -> h.addAll(buildBasicAuthHeaders()))
                .retrieve()
                .bodyToMono(Object.class)
                .block();
    }


    // ---------------- NEW: CREATE ORG SAFELY ----------------
    public Object createOrganization(String body) {
        try {
            log.info("Creating organization with payload: {}", body);
            return post("/api/orgs", body);
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                log.warn("Organization already exists: {}", body);
                throw new OrganizationAlreadyExistsException(body);
            }
            log.error("Error creating organization: {}", e.getResponseBodyAsString(), e);
            throw new GrafanaClientException("Failed to create organization", e);
        }
    }
}
