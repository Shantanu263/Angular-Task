package in.cybervisible.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserWithOrgDTO {
    private Integer id;
    private String name;
    private String login;
    private String email;
    private String organisation;
    private String role;
}
