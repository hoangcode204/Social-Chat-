package com.nicolas.chatapp.dto.response;

import com.nicolas.chatapp.model.Message;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Builder
public record MessageDTO(UUID id, String content, LocalDateTime timeStamp, UserDTO user, Set<UUID> readBy, Map<String, Set<UUID>> reactions, MessageDTO replyTo) {
    public static MessageDTO fromMessage(Message message) {
        if (Objects.isNull(message)) return null;
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timeStamp(message.getTimeStamp())
                .user(UserDTO.fromUser(message.getUser()))
                .readBy(new HashSet<>(message.getReadBy()))
                .reactions(message.getReactions() != null ? new HashMap<>(message.getReactions()) : null)
                .replyTo(fromMessage(message.getReplyTo()))
                .build();
    }

    public static List<MessageDTO> fromMessages(Collection<Message> messages) {
        if (Objects.isNull(messages)) return List.of();
        return messages.stream()
                .map(MessageDTO::fromMessage)
                .toList();
    }
}
