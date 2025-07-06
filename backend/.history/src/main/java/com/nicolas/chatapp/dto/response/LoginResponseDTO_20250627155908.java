package com.nicolas.chatapp.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponseDTO {
    private String token;
    private boolean isAuthenticated;

    public LoginResponseDTO() {}

    public LoginResponseDTO(String token, boolean isAuthenticated) {
        this.token = token;
        this.isAuthenticated = isAuthenticated;
    }
}
