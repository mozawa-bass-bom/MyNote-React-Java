// src/main/java/com/mynote/app/domain/entity/PasswordResetToken.java
package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PasswordResetToken {
    private Long id;
    private Long userId;
    private String tokenHash;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    private String requestIp;
    private String userAgent;
}
