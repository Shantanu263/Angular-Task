package in.cybervisible.exception;

public class OrganizationAlreadyExistsException extends RuntimeException {
    public OrganizationAlreadyExistsException(String orgName) {
        super("Organization '" + orgName + "' already exists.");
    }
}

