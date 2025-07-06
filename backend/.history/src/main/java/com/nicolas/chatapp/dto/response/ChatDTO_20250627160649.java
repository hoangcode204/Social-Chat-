package com.nicolas.chatapp.dto.response;

import com.nicolas.chatapp.model.Chat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.util.stream.Collectors;

@Builder
public class ChatDTO {
    private UUID id;
    private String name;
    private boolean isGroup;
    private Set<UserDTO> users;
    private List<MessageDTO> messages;

    public ChatDTO() {}

    public ChatDTO(UUID id, String name, boolean isGroup, Set<UserDTO> users, List<MessageDTO> messages) {
        this.id = id;
        this.name = name;
        this.isGroup = isGroup;
        this.users = users;
        this.messages = messages;
    }

    public static ChatDTO fromChat(Chat chat) {
        if (Objects.isNull(chat)) return null;
        return ChatDTO.builder()
                .id(chat.getId())
                .name(chat.getName())
                .isGroup(chat.isGroup())
                .users(UserDTO.fromUsers(chat.getUsers()))
                .messages(MessageDTO.fromMessages(chat.getMessages()))
                .build();
    }

    public static List<ChatDTO> fromChats(Collection<Chat> chats) {
        if (Objects.isNull(chats)) return List.of();
        return chats.stream()
                .map(ChatDTO::fromChat)
                .toList();
    }
}
