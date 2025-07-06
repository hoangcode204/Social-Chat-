package com.nicolas.chatapp.dto.response;

import com.nicolas.chatapp.model.Message;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
public class MessageDTO {
    private UUID id;
    private String content;
    private LocalDateTime timestamp;
    private UserDTO sender;
    private boolean isRead;

    public MessageDTO() {}

    public MessageDTO(UUID id, String content, LocalDateTime timestamp, UserDTO sender, boolean isRead) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.isRead = isRead;
    }

    public static MessageDTO fromMessage(Message message) {
        if (Objects.isNull(message)) return null;
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .sender(UserDTO.fromUser(message.getSender()))
                .isRead(message.isRead())
                .build();
    }

    public static List<MessageDTO> fromMessages(Collection<Message> messages) {
        if (Objects.isNull(messages)) return List.of();
        return messages.stream()
                .map(MessageDTO::fromMessage)
                .toList();
    }
}
