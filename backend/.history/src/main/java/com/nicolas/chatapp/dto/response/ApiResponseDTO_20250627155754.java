package com.nicolas.chatapp.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ApiResponseDTO {
    private String message;
    private boolean status;

    public ApiResponseDTO() {}

    public ApiResponseDTO(String message, boolean status) {
        this.message = message;
        this.status = status;
    }
}
