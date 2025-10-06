package in.cybervisible.exception;

public class GrafanaClientException extends RuntimeException {
    public GrafanaClientException(String message, Throwable cause) {
        super(message, cause);
    }
}
