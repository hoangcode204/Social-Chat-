package com.nicolas.chatapp.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public record ApiResponseDTO(String message, boolean status) {
}
