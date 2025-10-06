package in.cybervisible.dtos;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserUpdateDTO {
    String name;
    String email;
    String login;
}
