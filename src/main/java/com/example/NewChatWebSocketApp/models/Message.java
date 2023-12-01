package com.example.NewChatWebSocketApp.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    private String content;
    private String sender;
    private MessageType type;

    public enum MessageType{
        CHAT, LEAVE, JOIN
    }
}
