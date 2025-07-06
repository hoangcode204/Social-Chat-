package com.nicolas.chatapp.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
public class GroupChatRequestDTO {
    private String name;
    private Set<UUID> userIds;

    public GroupChatRequestDTO() {}

    public GroupChatRequestDTO(String name, Set<UUID> userIds) {
        this.name = name;
        this.userIds = userIds;
    }
}
