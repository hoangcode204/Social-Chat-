package com.nicolas.chatapp.dto.request;

import lombok.Data;

@Data
public class SignalingMessageDTO {
    private String type; // "offer", "answer", "candidate", "join", "leave"
    private String roomId;
    private String senderId;
    private String receiverId;
    private String sdp; // for offer/answer
    private String candidate; // for ICE candidate
} 