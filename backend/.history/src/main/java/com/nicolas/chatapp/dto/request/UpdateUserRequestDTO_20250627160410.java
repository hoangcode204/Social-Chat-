package com.nicolas.chatapp.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UpdateUserRequestDTO {
    private String fullName;
    private String email;

    public UpdateUserRequestDTO() {}

    public UpdateUserRequestDTO(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }
}
