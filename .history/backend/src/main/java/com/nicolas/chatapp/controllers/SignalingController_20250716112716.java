package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.dto.request.SignalingMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/signal")
    public void signaling(@Payload SignalingMessageDTO message) {
        // Forward message to the receiver (by userId or roomId)
        if (message.getReceiverId() != null) {
            messagingTemplate.convertAndSend("/topic/signal/" + message.getReceiverId(), message);
        } else if (message.getRoomId() != null) {
            messagingTemplate.convertAndSend("/topic/signal/room/" + message.getRoomId(), message);
        }
    }
} 