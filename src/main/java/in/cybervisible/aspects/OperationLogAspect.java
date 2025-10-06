package in.cybervisible.aspects;

import in.cybervisible.models.OperationLog;
import in.cybervisible.repositories.OperationLogRepo;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogRepo operationLogRepo;
    private final ObjectMapper objectMapper = new ObjectMapper(); // For parsing JSON

    @AfterReturning(
            pointcut = "execution(* in.cybervisible.service.impl.UserServiceImpl.*(..)) && " +
                    "!execution(* in.cybervisible.service.impl.UserServiceImpl.get*(..))",
            returning = "result"
    )
    public void logUserOperation(Object result) {
        logOperation("User", result);
    }

    @AfterReturning(
            pointcut = "execution(* in.cybervisible.service.impl.OrganizationServiceImpl.*(..)) && " +
                    "!execution(* in.cybervisible.service.impl.OrganizationServiceImpl.list*(..))" +
                    "!execution(* in.cybervisible.service.impl.OrganizationServiceImpl.get*(..))",
            returning = "result"
    )
    public void logOrganizationOperation(Object result) {
        logOperation("Organization", result);
    }

    private void logOperation(String entity, Object result) {
        String details = extractMessage(result);

        OperationLog operationLog = OperationLog.builder()
                .entity(entity)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        operationLogRepo.save(operationLog);
    }

    private String extractMessage(Object result) {
        if (result == null) {
            return "null";
        }

        try {
            // Serialize result to JSON
            String json = objectMapper.writeValueAsString(result);

            // Parse JSON
            var root = objectMapper.readTree(json);


            // First try body.message
            if (root.has("body") && root.get("body").has("message")) {
                return root.get("body").get("message").asText();
            }

            // If body.response.message exists
            if (root.has("body") && root.get("body").has("response") && root.get("body").get("response").has("message")) {
                return root.get("body").get("response").get("message").asText();
            }

            // Fallback: if direct "message" exists
            if (root.has("message")) {
                return root.get("message").asText();
            }

            // Default fallback
            return json;

        } catch (Exception e) {
            return result.toString();
        }
    }

}