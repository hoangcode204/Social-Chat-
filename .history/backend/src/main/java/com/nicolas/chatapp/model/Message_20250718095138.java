package com.nicolas.chatapp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(columnDefinition = "TEXT")
    private String content;
    private LocalDateTime timeStamp;

    @ManyToOne
    private User user;

    @ManyToOne
    private Chat chat;

    @ElementCollection
    private Set<UUID> readBy = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "message_reactions", joinColumns = @JoinColumn(name = "message_id"))
    @MapKeyColumn(name = "reaction_type")
    @Column(name = "user_id")
    private Map<String, Set<UUID>> reactions;

    @ManyToOne
    private Message replyTo;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (!(obj instanceof Message other)) {
            return false;
        }
        return Objects.equals(content, other.getContent())
                && Objects.equals(timeStamp, other.getTimeStamp())
                && Objects.equals(user, other.getUser())
                && Objects.equals(chat, other.getChat());
    }

    @Override
    public int hashCode() {
        return Objects.hash(content, timeStamp, user, chat);
    }

    @Override
    public String toString() {
        return "Message{" +
                "id=" + id +
                ", content='" + content + '\'' +
                ", timeStamp=" + timeStamp +
                '}';
    }

}
