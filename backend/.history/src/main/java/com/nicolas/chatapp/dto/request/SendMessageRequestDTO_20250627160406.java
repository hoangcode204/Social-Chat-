package com.nicolas.chatapp.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class SendMessageRequestDTO {
    private UUID chatId;
    private String content;

    public SendMessageRequestDTO() {}

    public SendMessageRequestDTO(UUID chatId, String content) {
        this.chatId = chatId;
        this.content = content;
    }
}
